import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        ← Back to Deals
      </Link>

      {/* Section 1: Deal details */}
      <div className="flex items-start justify-between mt-4 mb-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-heading text-[28px] font-semibold text-foreground leading-tight">{deal.title}</h1>
          <StatusBadge status={deal.status} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SendOmModal
            dealId={deal.id}
            buyers={buyers}
            dealBuyers={dealBuyers}
          />
          <DealFormModal
            deal={deal}
            trigger={
              <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                Edit
              </Button>
            }
          />
          <DeleteDealDialog dealId={deal.id} />
        </div>
      </div>

      <Card className="bg-card border-border mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Address</p>
              <p className="text-base text-foreground">{deal.address ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Asking price</p>
              <p className="text-base text-foreground">{deal.price ?? '—'}</p>
            </div>
          </div>
          {deal.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
              <p className="text-base text-foreground leading-relaxed">{deal.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-12" />

      {/* Section 2: Notes */}
      <NotesSection notes={notes} dealId={deal.id} />

      <Separator className="my-12" />

      {/* Section 3: Files */}
      <FilesSection files={filesWithUrls} dealId={deal.id} userId={user.id} />

      <Separator className="my-12" />

      {/* Section 4: Activity */}
      <ActivityLogSection activities={activities} />
    </div>
  )
}
