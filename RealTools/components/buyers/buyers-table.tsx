'use client'

import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BuyerFormModal } from '@/components/buyers/buyer-form-modal'
import { DeleteBuyerDialog } from '@/components/buyers/delete-buyer-dialog'

type Buyer = {
  id: string
  name: string
  email: string
  tags: string[] | null
}

type Props = {
  buyers: Buyer[]
}

export function BuyersTable({ buyers }: Props) {
  if (buyers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center shadow-[0_12px_30px_rgba(35,45,72,0.05)]">
        <h2 className="text-lg font-semibold text-foreground">No buyers yet.</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Add your first buyer to get started.
        </p>
        <BuyerFormModal />
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-[0_12px_30px_rgba(35,45,72,0.05)]">
      <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-4 border-b border-border bg-[#fbfcfe] px-4 py-3 md:grid">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Name</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Email</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tags</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Actions</span>
      </div>

      <div className="divide-y divide-border/70">
        {buyers.map((buyer) => {
          const tags = buyer.tags ?? []
          const visibleTags = tags.slice(0, 3)
          const overflowCount = tags.length - visibleTags.length

          return (
            <div
              key={buyer.id}
              className="grid min-h-12 gap-3 px-4 py-4 transition-colors hover:bg-[#f8fafc] md:grid-cols-[1fr_1fr_1fr_auto] md:items-center md:gap-4 md:py-3"
            >
              <span className="text-sm text-foreground truncate">{buyer.name}</span>

              <span className="text-sm text-muted-foreground truncate">{buyer.email}</span>

              <div className="flex flex-wrap gap-1 items-center">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#e7eaf0] bg-[#f3f5f9] px-2 py-0.5 text-xs text-[#6b7280]"
                  >
                    {tag}
                  </span>
                ))}
                {overflowCount > 0 && (
                  <span className="text-xs text-muted-foreground px-1">
                    +{overflowCount} more
                  </span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2 md:justify-end">
                <BuyerFormModal
                  buyer={buyer}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label="Edit buyer"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <DeleteBuyerDialog buyerId={buyer.id} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
