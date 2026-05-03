import Link from 'next/link'
import { List } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type ImportRun = {
  id: string
  source: string
  status: string
  created_count: number
  updated_count: number
  skipped_count: number
  failed_count: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
}

function statusVariant(status: string) {
  if (status === 'failed') return 'destructive' as const
  if (status === 'partial') return 'outline' as const
  return 'default' as const
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

function canViewListings(run: ImportRun) {
  return run.status !== 'failed' && (run.created_count + run.updated_count) > 0
}

export function ImportRunsTable({ runs }: { runs: ImportRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        No import runs yet.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="hidden grid-cols-[0.7fr_0.8fr_repeat(4,0.45fr)_1fr_1.1fr_auto] gap-3 border-b border-border bg-secondary px-4 py-3 md:grid">
        {['Source', 'Status', 'New', 'Upd.', 'Skip', 'Fail', 'Time', 'Error', 'Listings'].map((label) => (
          <span key={label} className="text-[11px] font-medium uppercase text-muted-foreground">{label}</span>
        ))}
      </div>
      <div className="divide-y divide-border/70">
        {runs.map((run) => (
          <div
            key={run.id}
            className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[0.7fr_0.8fr_repeat(4,0.45fr)_1fr_1.1fr_auto] md:items-center"
          >
            <span className="font-medium text-foreground">{run.source}</span>
            <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
            <span className="text-muted-foreground">{run.created_count}</span>
            <span className="text-muted-foreground">{run.updated_count}</span>
            <span className="text-muted-foreground">{run.skipped_count}</span>
            <span className="text-muted-foreground">{run.failed_count}</span>
            <span className="text-muted-foreground">{formatDate(run.completed_at ?? run.started_at)}</span>
            <span className="break-words text-xs text-muted-foreground">{run.error_message ?? '-'}</span>
            <div>
              {canViewListings(run) ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/listings/import/runs/${run.id}`}>
                    <List className="mr-2 size-4" />
                    View
                  </Link>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
