import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Status badge config — D-13: subtle semantic tint + border, no saturated fills
const statusConfig = {
  active:      { label: 'Active',      className: 'bg-green-950/60 text-green-300 border border-green-800/40' },
  negotiating: { label: 'Negotiating', className: 'bg-yellow-950/60 text-yellow-300 border border-yellow-800/40' },
  closed:      { label: 'Closed',      className: 'bg-muted text-muted-foreground border border-border' },
} as const

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.active
  return <Badge className={config.className}>{config.label}</Badge>
}

type Deal = {
  id: string
  title: string
  address: string | null
  price: string | null
  status: string
}

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link href={`/deals/${deal.id}`} className="block group">
      <Card className="bg-card border-border rounded-xl hover:border-accent/30 transition-colors">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-heading text-lg font-semibold text-foreground leading-snug">{deal.title}</h3>
            <StatusBadge status={deal.status} />
          </div>
          {deal.address && (
            <p className="text-sm text-muted-foreground mt-1">{deal.address}</p>
          )}
          {deal.price && (
            <p className="text-sm font-medium text-foreground mt-1">{deal.price}</p>
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-5">
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors tracking-wide uppercase">
            View Deal →
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
