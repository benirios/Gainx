import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { recordOmOpenByToken } from '@/lib/tracking/record-om-open'
// DO NOT import createSupabaseServerClient — it calls cookies() which fails for unauthenticated requests
// Middleware matcher explicitly excludes /om/* so no auth is attempted on this route

export const dynamic = 'force-dynamic'

export default async function OmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { id } = await params
  const { ref } = await searchParams
  // sync factory — NOT awaited
  const supabase = createSupabaseServiceClient()

  // URL-based tracking (PRIMARY signal — D-12 / TRACK-01 / TRACK-03)
  // Called on every page load when ref is present; recordOmOpenByToken is idempotent.
  if (ref) {
    await recordOmOpenByToken(ref)
  }

  const { data: deal } = await supabase
    .from('deals')
    .select('id, title, address, price, description, status')
    .eq('id', id)
    .single()

  if (!deal) {
    return (
      <main className="min-h-screen bg-white text-zinc-900 flex items-center justify-center">
        <p className="text-zinc-500">Deal not found.</p>
      </main>
    )
  }

  // Fetch images from om-images bucket for this deal
  // Convention: files stored at {deal_id}/ prefix in om-images bucket
  const { data: imageFiles } = await supabase.storage
    .from('om-images')
    .list(deal.id, { limit: 20 })

  const images = (imageFiles ?? [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => {
      const { data } = supabase.storage
        .from('om-images')
        .getPublicUrl(`${deal.id}/${f.name}`)
      return data.publicUrl
    })

  const statusLabel =
    deal.status === 'active' ? 'Active'
    : deal.status === 'negotiating' ? 'Negotiating'
    : 'Closed'

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Top bar */}
      <header className="bg-zinc-900 text-white px-8 py-4 flex items-center justify-between">
        <span className="text-base font-semibold">RealTools</span>
        <span
          className={[
            'text-xs font-medium px-2 py-1 rounded-full border',
            deal.status === 'active'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : deal.status === 'negotiating'
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                : 'bg-zinc-700 text-zinc-300 border-zinc-600',
          ].join(' ')}
        >
          {statusLabel}
        </span>
      </header>

      {/* Hero */}
      <section className="px-8 py-12 border-b border-zinc-200">
        <h1 className="text-2xl font-semibold text-zinc-900 leading-tight">{deal.title}</h1>
        <p className="text-xl text-zinc-500 mt-2">{deal.address}</p>
      </section>

      {/* Property details grid */}
      <section className="px-8 py-8 grid grid-cols-2 md:grid-cols-3 gap-6 bg-zinc-50 border-b border-zinc-200">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400 mb-1">Asking Price</p>
          <p className="text-xl font-semibold text-zinc-900">{deal.price}</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-400 mb-1">Status</p>
          <p className="text-xl font-semibold text-zinc-900">{statusLabel}</p>
        </div>
      </section>

      {/* Description */}
      {deal.description && (
        <section className="px-8 py-8 border-b border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">Property Overview</h2>
          <p
            className="text-base text-zinc-700 leading-relaxed"
            style={{ maxWidth: '72ch' }}
          >
            {deal.description}
          </p>
        </section>
      )}

      {/* Images — only if om-images bucket has files for this deal */}
      {images.length > 0 && (
        <section className="px-8 py-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">Property Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((url, i) => (
              // Using plain <img> — avoids next.config.ts remotePatterns requirement for public OM page
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Property image ${i + 1}`}
                className="rounded-lg object-cover w-full"
                style={{ aspectRatio: '16/9' }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-zinc-200 bg-zinc-50 text-center">
        <p className="text-sm text-zinc-400">Powered by RealTools</p>
      </footer>

      {/* Tracking pixel (SECONDARY signal — D-13 / TRACK-02) — only when ref present */}
      {ref && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/track/${ref}`}
          width="1"
          height="1"
          style={{ display: 'none' }}
          alt=""
        />
      )}
    </main>
  )
}
