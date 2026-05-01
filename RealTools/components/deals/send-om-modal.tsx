'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { sendOmAction, type SendOmState } from '@/lib/actions/send-om-action'
import { toast } from 'sonner'

type Buyer = {
  id: string
  name: string
  email: string
  tags: string[] | null
}

type DealBuyerStatus = {
  buyer_id: string
  om_sent_at: string | null
}

type Props = {
  dealId: string
  buyers: Buyer[]
  dealBuyers: DealBuyerStatus[]
}

const initialState: SendOmState = {}

export function SendOmModal({ dealId, buyers, dealBuyers }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<string[]>([])
  const [state, formAction, isPending] = useActionState(sendOmAction, initialState)
  const prevPending = useRef(false)

  const sentByBuyerId = useMemo(
    () => new Map(dealBuyers.map((row) => [row.buyer_id, row.om_sent_at])),
    [dealBuyers]
  )

  useEffect(() => {
    if (prevPending.current && !isPending) {
      if (state.success) {
        toast.success(`OM sent to ${selectedBuyerIds.length} buyer${selectedBuyerIds.length === 1 ? '' : 's'}.`)
        setOpen(false)
        setSelectedBuyerIds([])
      } else if (state.errors?.general?.[0]) {
        toast.error(state.errors.general[0])
      } else if (state.errors?.buyerIds?.[0]) {
        toast.error(state.errors.buyerIds[0])
      }
    }
    prevPending.current = isPending
  }, [isPending, selectedBuyerIds.length, state])

  function toggleBuyer(buyerId: string, checked: boolean) {
    setSelectedBuyerIds((current) =>
      checked ? [...current, buyerId] : current.filter((id) => id !== buyerId)
    )
  }

  return (
    <>
      <Button
        type="button"
        className="bg-white text-zinc-950 hover:bg-zinc-100"
        onClick={() => setOpen(true)}
      >
        <Send className="size-4 mr-1" />
        Send OM
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Send OM</DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              Select buyers for this deal.
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="dealId" value={dealId} />
            <input type="hidden" name="buyerIds" value={JSON.stringify(selectedBuyerIds)} />

            {buyers.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">
                No buyers available.
              </p>
            ) : (
              <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-800 rounded-lg border border-zinc-800">
                {buyers.map((buyer) => {
                  const sentAt = sentByBuyerId.get(buyer.id)
                  const checked = selectedBuyerIds.includes(buyer.id)

                  return (
                    <label
                      key={buyer.id}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-zinc-800/60"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggleBuyer(buyer.id, value === true)}
                        disabled={isPending}
                        className="border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-zinc-950"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base text-zinc-50">{buyer.name}</span>
                        <span className="block truncate text-sm text-zinc-400">{buyer.email}</span>
                      </span>
                      {sentAt && (
                        <Badge className="bg-zinc-700 text-zinc-300 hover:bg-zinc-700">
                          Sent
                        </Badge>
                      )}
                    </label>
                  )
                })}
              </div>
            )}

            {state.errors?.dealId && (
              <p className="text-sm text-red-500">{state.errors.dealId[0]}</p>
            )}
            {state.errors?.buyerIds && (
              <p className="text-sm text-red-500">{state.errors.buyerIds[0]}</p>
            )}
            {state.errors?.general && (
              <p className="text-sm text-red-500">{state.errors.general[0]}</p>
            )}

            <DialogFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-400 hover:text-zinc-50"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-white text-zinc-950 hover:bg-zinc-100"
                disabled={isPending || buyers.length === 0 || selectedBuyerIds.length === 0}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  `Send to ${selectedBuyerIds.length} buyer${selectedBuyerIds.length === 1 ? '' : 's'}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
