'use client'

import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-base font-semibold text-zinc-50">No buyers yet.</h2>
        <p className="text-sm text-zinc-400 mt-2 mb-6">
          Add your first buyer to get started.
        </p>
        <BuyerFormModal />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-zinc-800">
        <span className="text-sm text-zinc-400">Name</span>
        <span className="text-sm text-zinc-400">Email</span>
        <span className="text-sm text-zinc-400">Tags</span>
        <span className="text-sm text-zinc-400">Actions</span>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-zinc-800/50">
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 min-h-[44px] bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
          >
            {/* Name */}
            <span className="text-base text-zinc-50 truncate">{buyer.name}</span>

            {/* Email */}
            <span className="text-base text-zinc-50 truncate">{buyer.email}</span>

            {/* Tags — max 3 visible (v1) */}
            <div className="flex flex-wrap gap-1">
              {(buyer.tags ?? []).slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  className="bg-zinc-700 text-zinc-300 text-xs rounded-full px-2 py-0.5 hover:bg-zinc-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <BuyerFormModal
                buyer={buyer}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-zinc-50"
                    aria-label="Edit buyer"
                  >
                    <Pencil className="size-4" />
                  </Button>
                }
              />
              <DeleteBuyerDialog buyerId={buyer.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
