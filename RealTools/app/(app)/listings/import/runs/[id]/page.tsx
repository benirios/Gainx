import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

type PageProps = {
  params: Promise<{ id: string }>
}

type ListingRow = {
  id: string
  title: string
  price_text: string | null
  location_text: string | null
  address_text: string | null
  state: string | null
  city: string | null
  source: string
  source_url: string
  images: string[] | null
  created_at: string | null
}

function getSavedUrls(metadata: Json | null): string[] {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return []
  const savedUrls = metadata.savedUrls
  if (!Array.isArray(savedUrls)) return []
  return savedUrls.filter((url): url is string => typeof url === 'string' && url.length > 0)
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default async function ImportRunListingsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: run } = await (supabase.from('listing_import_runs') as any)
    .select('id, source, status, created_count, updated_count, failed_count, error_message, metadata, completed_at, started_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!run) notFound()

  const savedUrls = getSavedUrls(run.metadata)
  let listings: ListingRow[] = []

  if (savedUrls.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('listings') as any)
      .select('id, title, price_text, location_text, address_text, state, city, source, source_url, images, created_at')
      .eq('user_id', user.id)
      .in('source_url', savedUrls)
      .order('created_at', { ascending: false })

    listings = (data ?? []) as ListingRow[]
  }

  const savedCount = (run.created_count ?? 0) + (run.updated_count ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link href="/listings/import">Back to imports</Link>
          </Button>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">Scraped Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {run.source} run from {formatDate(run.completed_at ?? run.started_at)}
          </p>
        </div>
        <Badge variant={run.status === 'failed' ? 'destructive' : run.status === 'partial' ? 'outline' : 'default'}>
          {run.status}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Saved</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{savedCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Shown</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{listings.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Failed</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{run.failed_count ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Source</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{run.source}</p>
        </div>
      </div>

      {run.error_message && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          {run.error_message}
        </div>
      )}

      {savedUrls.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          This run does not have saved listing URL metadata. Run a new OLX search to view exact scraped listings here.
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          No saved listings were found for this run.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="hidden grid-cols-[64px_1.6fr_0.8fr_1fr_0.7fr_auto] gap-4 border-b border-border bg-secondary px-4 py-3 md:grid">
            {['Image', 'Listing', 'Price', 'Location', 'Source', 'Open'].map((label) => (
              <span key={label} className="text-[11px] font-medium uppercase text-muted-foreground">{label}</span>
            ))}
          </div>
          <div className="divide-y divide-border/70">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[64px_1.6fr_0.8fr_1fr_0.7fr_auto] md:items-center"
              >
                <div className="size-16 overflow-hidden rounded-md border border-border bg-secondary">
                  {listing.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.images[0]} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{listing.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{listing.address_text ?? listing.location_text ?? '-'}</p>
                </div>
                <span className="font-medium text-foreground">{listing.price_text ?? '-'}</span>
                <span className="text-muted-foreground">{[listing.city, listing.state].filter(Boolean).join(', ') || '-'}</span>
                <Badge variant="outline">{listing.source}</Badge>
                <Button asChild variant="outline" size="sm">
                  <a href={listing.source_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 size-4" />
                    OLX
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
