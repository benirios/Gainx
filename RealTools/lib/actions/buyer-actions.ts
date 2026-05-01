'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BuyerSchema, type BuyerState } from '@/lib/schemas/buyer'
import type { Database } from '@/types/supabase'

type BuyerInsert = Database['public']['Tables']['buyers']['Insert']
type BuyerUpdate = Database['public']['Tables']['buyers']['Update']

export async function createBuyerAction(
  _prevState: BuyerState,
  formData: FormData
): Promise<BuyerState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Parse tags from JSON-serialized hidden input (D-11)
  const tagsRaw = formData.get('tags') as string
  const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : []

  const parsed = BuyerSchema.safeParse({
    name:  formData.get('name'),
    email: formData.get('email'),
    tags,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const insertData: BuyerInsert = {
    ...parsed.data,
    user_id: user.id,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('buyers') as any).insert(insertData)

  if (error) return { errors: { general: ['Failed to save buyer. Please try again.'] } }

  revalidatePath('/buyers')
  return {}
}

export async function updateBuyerAction(
  _prevState: BuyerState,
  formData: FormData
): Promise<BuyerState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const buyerId = formData.get('buyerId') as string
  if (!buyerId) return { errors: { general: ['Missing buyer ID.'] } }

  // Parse tags from JSON-serialized hidden input (D-11)
  const tagsRaw = formData.get('tags') as string
  const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : []

  const parsed = BuyerSchema.safeParse({
    name:  formData.get('name'),
    email: formData.get('email'),
    tags,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const updateData: BuyerUpdate = {
    ...parsed.data,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('buyers') as any)
    .update(updateData)
    .eq('id', buyerId)
    .eq('user_id', user.id)

  if (error) return { errors: { general: ['Failed to save buyer. Please try again.'] } }

  revalidatePath('/buyers')
  return {}
}

export async function deleteBuyerAction(buyerId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('buyers') as any)
    .delete()
    .eq('id', buyerId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to delete. Please try again.' }

  revalidatePath('/buyers')
  return {}
}
