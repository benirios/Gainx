import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DealCard } from '@/components/deals/deal-card'
import { DealFormModal } from '@/components/deals/deal-form-modal'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deals } = await (supabase.from('deals') as any)
    .select('id, title, address, price, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) as {
      data: { id: string; title: string; address: string | null; price: string | null; status: string }[] | null
    }

  const dealList = deals ?? []

  return (
    <div>
      {/* Page header — D-02: serif title, right-aligned action */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-[28px] font-semibold text-foreground leading-tight">Deals</h1>
        <DealFormModal />
      </div>

      {dealList.length === 0 ? (
        /* Empty state — D-04: single-panel, one CTA, muted helper text */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="font-heading text-xl font-semibold text-foreground">No deals yet.</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
            Create a deal to start building the workspace, OM, buyers, and activity history in one place.
          </p>
          <DealFormModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealList.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
