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
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-zinc-50">Deals</h1>
        <DealFormModal />
      </div>

      {dealList.length === 0 ? (
        /* Empty state per D-03 + UI-SPEC Copywriting Contract */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="text-xl font-semibold text-zinc-50">No deals yet.</h2>
          <p className="text-base text-zinc-400 mt-2 mb-6">
            Create your first deal to get started.
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
