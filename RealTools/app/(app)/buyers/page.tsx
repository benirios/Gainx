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
    <div className="p-8">
      {/* Page header — D-02: serif title, muted support copy, right-aligned action */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-[28px] font-semibold leading-tight text-foreground">
            Buyers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your buyer contacts and tags.
          </p>
        </div>
        {(buyers ?? []).length > 0 && <BuyerFormModal />}
      </div>

      {/* Buyers table / empty state */}
      <BuyersTable buyers={buyers ?? []} />
    </div>
  )
}
