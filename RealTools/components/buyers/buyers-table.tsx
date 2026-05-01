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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="font-heading text-xl font-semibold text-foreground">No buyers yet.</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Add your first buyer to get started.
        </p>
        <BuyerFormModal />
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg border border-border overflow-hidden">
      {/* Table header — D-10 */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tags</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</span>
      </div>

      {/* Table rows — D-10: min-h-[44px], subtle hover */}
      <div className="divide-y divide-border/50">
        {buyers.map((buyer) => {
          const tags = buyer.tags ?? []
          const visibleTags = tags.slice(0, 3)
          const overflowCount = tags.length - visibleTags.length

          return (
            <div
              key={buyer.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 min-h-[44px] hover:bg-muted/50 transition-colors"
            >
              {/* Name */}
              <span className="text-sm text-foreground truncate">{buyer.name}</span>

              {/* Email */}
              <span className="text-sm text-muted-foreground truncate">{buyer.email}</span>

              {/* Tags — D-14: neutral muted pills, max 3 + overflow indicator */}
              <div className="flex flex-wrap gap-1 items-center">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full border border-border/60"
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

              {/* Actions — D-16: aria-label on icon controls */}
              <div className="flex items-center gap-2 shrink-0">
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
