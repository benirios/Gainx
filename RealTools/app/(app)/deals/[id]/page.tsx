import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/deals/deal-card'
import { DealFormModal } from '@/components/deals/deal-form-modal'
import { DeleteDealDialog } from '@/components/deals/delete-deal-dialog'
import { NotesSection } from '@/components/notes/notes-section'
import { FilesSection } from '@/components/files/files-section'
import { SendOmModal } from '@/components/deals/send-om-modal'
import { ActivityLogSection } from '@/components/deals/activity-log-section'
import type { Database } from '@/types/supabase'

type DealRow = Database['public']['Tables']['deals']['Row']
type NoteRow = Database['public']['Tables']['notes']['Row']
type DealFileRow = Database['public']['Tables']['deal_files']['Row']
type BuyerRow = Database['public']['Tables']['buyers']['Row']
type DealBuyerRow = Database['public']['Tables']['deal_buyers']['Row']
type ActivityRow = Database['public']['Tables']['activities']['Row']

export default async function DealHubPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Parallel fetch — never fetch per-component (RESEARCH.md Anti-Pattern)
  // All queries use `as any` cast to bypass supabase-js 2.104.x PostgrestVersion=never inference bug
  const [
    dealResult,
    notesResult,
    filesResult,
    buyersResult,
    dealBuyersResult,
    activitiesResult,
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('deals') as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single() as Promise<{ data: DealRow | null; error: unknown }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('notes') as any)
      .select('*')
      .eq('deal_id', id)
      .order('created_at', { ascending: false }) as Promise<{ data: NoteRow[] | null; error: unknown }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('deal_files') as any)
      .select('*')
      .eq('deal_id', id)
      .order('created_at', { ascending: false }) as Promise<{ data: DealFileRow[] | null; error: unknown }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('buyers') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as Promise<{ data: BuyerRow[] | null; error: unknown }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('deal_buyers') as any)
      .select('buyer_id, om_sent_at')
      .eq('deal_id', id) as Promise<{
        data: Pick<DealBuyerRow, 'buyer_id' | 'om_sent_at'>[] | null
        error: unknown
      }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('activities') as any)
      .select('*')
      .eq('deal_id', id)
      .order('created_at', { ascending: false }) as Promise<{ data: ActivityRow[] | null; error: unknown }>,
  ])

  if (!dealResult.data) notFound()

  const deal = dealResult.data
  const notes: NoteRow[] = notesResult.data ?? []
  const buyers: BuyerRow[] = buyersResult.data ?? []
  const dealBuyers = dealBuyersResult.data ?? []
  const activities: ActivityRow[] = activitiesResult.data ?? []

  // Generate signed URLs server-side — 1-hour expiry, one request per file
  const rawFiles = filesResult.data ?? []
  const filesWithUrls = await Promise.all(
    rawFiles.map(async (f) => {
      const { data } = await supabase.storage
        .from('deal-files')
        .createSignedUrl(f.storage_path, 3600)
      return { ...f, signedUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Deals
      </Link>

      <section className="rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(35,45,72,0.05)] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="max-w-4xl text-2xl font-semibold leading-tight text-foreground md:text-[28px]">
                {deal.title}
              </h1>
              <StatusBadge status={deal.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-[#fbfcfe] p-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Address
                </p>
                <p className="text-sm text-foreground">{deal.address ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-[#fbfcfe] p-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Asking price
                </p>
                <p className="text-sm text-foreground">{deal.price ?? '—'}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <SendOmModal
              dealId={deal.id}
              buyers={buyers}
              dealBuyers={dealBuyers}
            />
            <DealFormModal
              deal={deal}
              trigger={
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              }
            />
            <DeleteDealDialog dealId={deal.id} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Building2 className="size-4" />
                </span>
                <h2 className="text-[15px] font-medium text-foreground">Deal details</h2>
              </div>
              {deal.description ? (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm leading-6 text-foreground">{deal.description}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No description added.</p>
              )}
            </CardContent>
          </Card>

          <NotesSection notes={notes} dealId={deal.id} />

          <FilesSection files={filesWithUrls} dealId={deal.id} userId={user.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#eaf3ff] text-[#497db7]">
                  <FileText className="size-4" />
                </span>
                <h2 className="text-[15px] font-medium text-foreground">Send status</h2>
              </div>
              <div className="space-y-2">
                {dealBuyers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No OMs sent for this deal yet.</p>
                ) : (
                  dealBuyers.map((row) => {
                    const buyer = buyers.find((item) => item.id === row.buyer_id)
                    return (
                      <div
                        key={row.buyer_id}
                        className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-border/70 bg-[#fbfcfe] px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-sm text-foreground">
                          {buyer?.name ?? 'Unknown buyer'}
                        </span>
                        <span className="shrink-0 rounded-md border border-[#cfe4ff] bg-[#eaf3ff] px-2 py-0.5 text-xs font-medium text-[#497db7]">
                          {row.om_sent_at ? 'Sent' : 'Not sent'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <ActivityLogSection activities={activities} />
        </div>
      </div>
    </div>
  )
}
