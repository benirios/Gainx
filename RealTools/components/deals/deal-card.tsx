import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Status badge config — D-13: subtle semantic tint + border, no saturated fills
const statusConfig = {
  active:      { label: 'Active',      className: 'bg-[#153332] text-[#62ddd6] border border-[#285a58]' },
  negotiating: { label: 'Negotiating', className: 'bg-primary/15 text-primary border border-primary/25' },
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
      <Card className="rounded-lg border-border bg-card transition-all hover:border-primary/45 hover:shadow-[0_18px_42px_rgba(5,10,20,0.32)]">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-[15px] font-medium text-foreground leading-snug">{deal.title}</h3>
            <StatusBadge status={deal.status} />
          </div>
          {deal.address && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{deal.address}</span>
            </p>
          )}
          {deal.price && (
            <p className="text-sm font-medium text-foreground mt-1">{deal.price}</p>
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-5">
          <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-foreground">
            Open deal
            <ArrowRight className="size-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
