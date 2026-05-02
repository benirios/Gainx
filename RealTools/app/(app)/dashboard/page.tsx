import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Briefcase, CheckCircle2, CircleDollarSign, Clock3 } from 'lucide-react'
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
  const totalDeals = dealList.length
  const activeDeals = dealList.filter((deal) => deal.status === 'active').length
  const negotiatingDeals = dealList.filter((deal) => deal.status === 'negotiating').length
  const closedDeals = dealList.filter((deal) => deal.status === 'closed').length

  const summaryCards = [
    { label: 'Total deals', value: totalDeals, icon: Briefcase, className: 'bg-[#f0eeff] text-[#6759c7]' },
    { label: 'Active', value: activeDeals, icon: CheckCircle2, className: 'bg-[#e7faf8] text-[#249c96]' },
    { label: 'Negotiating', value: negotiatingDeals, icon: Clock3, className: 'bg-[#eaf3ff] text-[#497db7]' },
    { label: 'Closed', value: closedDeals, icon: CircleDollarSign, className: 'bg-[#f3f5f9] text-[#6b7280]' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">Deals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage active opportunities, buyers, files, and OM activity from one workspace.
          </p>
        </div>
        <DealFormModal />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, className }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(35,45,72,0.05)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold leading-none text-foreground">
                  {value}
                </p>
              </div>
              <span className={`flex size-10 items-center justify-center rounded-lg ${className}`}>
                <Icon className="size-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {dealList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16 text-center shadow-[0_12px_30px_rgba(35,45,72,0.05)]">
          <span className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#f0eeff] text-[#6759c7]">
            <Briefcase className="size-6" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">No deals yet.</h2>
          <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
            Create a deal to start building the workspace, OM, buyers, and activity history in one place.
          </p>
          <DealFormModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dealList.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
