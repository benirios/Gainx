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
import { TagInput } from '@/components/ui/tag-input'
import { createBuyerAction, updateBuyerAction } from '@/lib/actions/buyer-actions'
import { type BuyerState } from '@/lib/schemas/buyer'
import { toast } from 'sonner'

type Buyer = {
  id: string
  name: string
  email: string
  tags: string[] | null
}

type Props = {
  buyer?: Buyer          // undefined = create mode, defined = edit mode
  trigger?: React.ReactNode  // custom trigger (defaults to "New Buyer" button)
}

const initialState: BuyerState = {}

export function BuyerFormModal({ buyer, trigger }: Props) {
  const isEdit = !!buyer

  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateBuyerAction : createBuyerAction,
    initialState
  )

  // Detect transition from pending -> not pending with no errors -> success
  const prevPending = useRef(false)
  useEffect(() => {
    if (prevPending.current && !isPending && !state.errors) {
      setOpen(false)
      toast.success('Buyer saved.')
    }
    prevPending.current = isPending
  }, [isPending, state])

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4 mr-2" />
          New Buyer
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[32rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Buyer' : 'New Buyer'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEdit ? 'Update the buyer details.' : 'Fill in the details below.'}
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            {isEdit && (
              <input type="hidden" name="buyerId" value={buyer.id} />
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={buyer?.name}
                placeholder="Jane Smith"
                disabled={isPending}
              />
              {state.errors?.name && (
                <p className="text-xs text-destructive">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={buyer?.email}
                placeholder="jane@acme.com"
                disabled={isPending}
              />
              {state.errors?.email && (
                <p className="text-xs text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Tags</Label>
              <TagInput
                name="tags"
                defaultValue={buyer?.tags ?? []}
                disabled={isPending}
                placeholder="Type a tag and press Enter"
              />
              {state.errors?.tags && (
                <p className="text-xs text-destructive">{state.errors.tags[0]}</p>
              )}
            </div>

            {state.errors?.general && (
              <p className="text-xs text-destructive">{state.errors.general[0]}</p>
            )}

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Buyer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
