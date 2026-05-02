import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Status badge config — D-13: subtle semantic tint + border, no saturated fills
const statusConfig = {
  active:      { label: 'Active',      className: 'bg-[#e7faf8] text-[#249c96] border border-[#bfeeea]' },
  negotiating: { label: 'Negotiating', className: 'bg-[#f0eeff] text-[#6759c7] border border-[#ddd7ff]' },
  closed:      { label: 'Closed',      className: 'bg-[#f3f5f9] text-[#6b7280] border border-[#e7eaf0]' },
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
      <Card className="rounded-lg border-border bg-card transition-all hover:border-[#d9ddf7] hover:shadow-[0_16px_36px_rgba(35,45,72,0.07)]">
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
