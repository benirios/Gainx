'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Explicit table types to work around supabase-js 2.104.x __InternalSupabase
// PostgrestVersion inference issue that causes from() to return Relation=never.
type DealInsert = Database['public']['Tables']['deals']['Insert']
type DealUpdate = Database['public']['Tables']['deals']['Update']
type DealFileRow = Database['public']['Tables']['deal_files']['Row']

export const DealSchema = z.object({
  title:       z.string().min(2, 'Deal title is required'),
  address:     z.string().min(5, 'Address is required'),
  price:       z.string().min(1, 'Asking price is required'),
  status:      z.enum(['active', 'negotiating', 'closed']).default('active'),
  description: z.string().optional(),
})

export type DealFormValues = z.infer<typeof DealSchema>

export type DealState = {
  errors?: {
    title?:       string[]
    address?:     string[]
    price?:       string[]
    status?:      string[]
    description?: string[]
    general?:     string[]
  }
}

export async function createDealAction(
  _prevState: DealState,
  formData: FormData
): Promise<DealState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const parsed = DealSchema.safeParse({
    title:       formData.get('title'),
    address:     formData.get('address'),
    price:       formData.get('price'),
    status:      formData.get('status') ?? 'active',
    description: formData.get('description') ?? undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const insertData: DealInsert = {
    ...parsed.data,
    user_id: user.id,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('deals') as any).insert(insertData)

  if (error) return { errors: { general: ['Failed to save deal. Please try again.'] } }

  revalidatePath('/dashboard')
  return {}
}

export async function updateDealAction(
  _prevState: DealState,
  formData: FormData
): Promise<DealState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dealId = formData.get('dealId') as string
  if (!dealId) return { errors: { general: ['Missing deal ID.'] } }

  const parsed = DealSchema.safeParse({
    title:       formData.get('title'),
    address:     formData.get('address'),
    price:       formData.get('price'),
    status:      formData.get('status') ?? 'active',
    description: formData.get('description') ?? undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const updateData: DealUpdate = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('deals') as any)
    .update(updateData)
    .eq('id', dealId)
    .eq('user_id', user.id)

  if (error) return { errors: { general: ['Failed to save deal. Please try again.'] } }

  revalidatePath('/dashboard')
  revalidatePath(`/deals/${dealId}`)
  return {}
}

export async function deleteDealAction(dealId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch storage paths before deleting deal (cascade will remove deal_files rows)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: files } = await (supabase.from('deal_files') as any)
    .select('storage_path')
    .eq('deal_id', dealId) as { data: Pick<DealFileRow, 'storage_path'>[] | null }

  // Remove files from Storage (best-effort — orphan files waste quota but don't block)
  if (files && files.length > 0) {
    const paths = files.map((f) => f.storage_path)
    await supabase.storage.from('deal-files').remove(paths)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('deals') as any)
    .delete()
    .eq('id', dealId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to delete. Please try again.' }

  revalidatePath('/dashboard')
  return {}
}
