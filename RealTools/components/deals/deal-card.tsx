import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Status badge config per UI-SPEC Color section + CONTEXT.md D-02
const statusConfig = {
  active:      { label: 'Active',      className: 'bg-green-500/10 text-green-500 border border-green-500/20' },
  negotiating: { label: 'Negotiating', className: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' },
  closed:      { label: 'Closed',      className: 'bg-zinc-800 text-zinc-400 border border-zinc-700' },
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
      <Card className="bg-zinc-900 border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-zinc-50 leading-snug">{deal.title}</h3>
            <StatusBadge status={deal.status} />
          </div>
          {deal.address && (
            <p className="text-sm text-zinc-400 mt-2">{deal.address}</p>
          )}
          {deal.price && (
            <p className="text-sm text-zinc-400">{deal.price}</p>
          )}
        </CardContent>
        <CardFooter>
          <span className="text-sm text-zinc-400 group-hover:text-zinc-50 transition-colors">
            View Deal →
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
