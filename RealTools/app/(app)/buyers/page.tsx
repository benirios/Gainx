import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BuyersTable } from '@/components/buyers/buyers-table'
import { BuyerFormModal } from '@/components/buyers/buyer-form-modal'
import type { Database } from '@/types/supabase'

type BuyerRow = Database['public']['Tables']['buyers']['Row']

export default async function BuyersPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: buyers } = await (supabase.from('buyers') as any)
    .select('id, name, email, tags')
    .eq('user_id', user.id)
    .order('name', { ascending: true }) as { data: Pick<BuyerRow, 'id' | 'name' | 'email' | 'tags'>[] | null }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            Buyers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your buyer contacts and tags.
          </p>
        </div>
        {(buyers ?? []).length > 0 && <BuyerFormModal />}
      </div>

      <BuyersTable buyers={buyers ?? []} />
    </div>
  )
}
