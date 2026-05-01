'use client'

import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteBuyerAction } from '@/lib/actions/buyer-actions'
import { toast } from 'sonner'

export function DeleteBuyerDialog({ buyerId }: { buyerId: string }) {
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    setPending(true)
    const result = await deleteBuyerAction(buyerId)
    setPending(false)
    if (result.error) {
      toast.error('Failed to delete. Please try again.')
    } else {
      toast.success('Buyer deleted.')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-red-400"
          aria-label="Delete buyer"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      {/* D-12: content-fit modal width */}
      <AlertDialogContent className="bg-card border-border text-foreground sm:max-w-[32rem]">
        <AlertDialogHeader>
          {/* serif title via global [data-slot="alert-dialog-title"] rule */}
          <AlertDialogTitle>Delete Buyer?</AlertDialogTitle>
          {/* D-11: subdued destructive copy */}
          <AlertDialogDescription className="text-muted-foreground">
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* D-09: right-aligned actions, mobile stack fallback */}
        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <AlertDialogCancel
            className="border-border text-foreground hover:bg-muted w-full sm:w-auto disabled:opacity-50"
            disabled={pending}
          >
            Keep
          </AlertDialogCancel>
          {/* D-11: subdued destructive — border+tint, no saturated fill */}
          <AlertDialogAction
            onClick={handleDelete}
            disabled={pending}
            className="border border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/20 w-full sm:w-auto disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
