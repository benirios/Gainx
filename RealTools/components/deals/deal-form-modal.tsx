'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDealAction, updateDealAction, type DealState } from '@/lib/actions/deal-actions'
import { toast } from 'sonner'

type Deal = {
  id: string
  title: string
  address: string | null
  price: string | null
  status: string
  description?: string | null
}

type Props = {
  deal?: Deal          // undefined = create mode, defined = edit mode
  trigger?: React.ReactNode  // custom trigger (defaults to "New Deal" button)
}

const initialState: DealState = {}

export function DealFormModal({ deal, trigger }: Props) {
  const isEdit = !!deal

  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateDealAction : createDealAction,
    initialState
  )

  // Detect transition from pending → not pending with no errors → success
  const prevPending = useRef(false)
  useEffect(() => {
    if (prevPending.current && !isPending && !state.errors) {
      setOpen(false)
      toast.success(isEdit ? 'Deal updated.' : 'Deal created.')
    }
    prevPending.current = isPending
  }, [isPending, state, isEdit])

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="bg-white text-zinc-950 hover:bg-zinc-100"
        >
          <Plus className="size-4 mr-2" />
          New Deal
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Deal' : 'New Deal'}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              {isEdit ? 'Update the deal details.' : 'Fill in the details below.'}
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            {isEdit && (
              <input type="hidden" name="dealId" value={deal.id} />
            )}
            {/* Deal title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-300">Deal title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={deal?.title}
                placeholder="123 Main St Retail Center"
                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                disabled={isPending}
              />
              {state.errors?.title && (
                <p className="text-sm text-red-500">{state.errors.title[0]}</p>
              )}
            </div>
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-zinc-300">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={deal?.address ?? ''}
                placeholder="123 Main St, City, State ZIP"
                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                disabled={isPending}
              />
              {state.errors?.address && (
                <p className="text-sm text-red-500">{state.errors.address[0]}</p>
              )}
            </div>
            {/* Asking price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-zinc-300">Asking price</Label>
              <Input
                id="price"
                name="price"
                type="text"
                defaultValue={deal?.price ?? ''}
                placeholder="$4,500,000"
                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                disabled={isPending}
              />
              {state.errors?.price && (
                <p className="text-sm text-red-500">{state.errors.price[0]}</p>
              )}
            </div>
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Status</Label>
              <Select name="status" defaultValue={deal?.status ?? 'active'} disabled={isPending}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={deal?.description ?? ''}
                placeholder="Describe the property, opportunity, and key highlights…"
                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                disabled={isPending}
              />
            </div>
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
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Deal'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
