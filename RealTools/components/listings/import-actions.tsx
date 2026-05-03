'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { Loader2, Play, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { importManualListingsAction, runOlxImportAction, seedDefaultImportTargetsAction, type ManualImportState } from '@/lib/actions/listing-import-actions'

const initialManualImportState: ManualImportState = {}

export function RunOlxImportButton({ targetId }: { targetId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await runOlxImportAction(targetId)
          if (result.ok) {
            toast.success(result.message)
          } else {
            toast.error(result.message)
          }
        })
      }}
    >
      {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4" />}
      Run OLX
    </Button>
  )
}

export function SeedDefaultTargetsButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await seedDefaultImportTargetsAction()
          if (result.ok) {
            toast.success(result.message)
          } else {
            toast.error(result.message)
          }
        })
      }}
    >
      {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
      Add default targets
    </Button>
  )
}

export function ManualImportForm() {
  const [state, formAction, isPending] = useActionState(importManualListingsAction, initialManualImportState)
  const [csv, setCsv] = useState('')
  const previousPending = useRef(false)

  useEffect(() => {
    if (previousPending.current && !isPending && state.message && !state.errors) {
      toast.success(state.message)
      setCsv('')
    }
    previousPending.current = isPending
  }, [isPending, state])

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Manual / Facebook CSV Import</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Headers: title, source_url, price_text, location_text, address_text, description, state, city, neighborhood, images
        </p>
      </div>

      <Textarea
        name="csv"
        value={csv}
        onChange={(event) => setCsv(event.target.value)}
        disabled={isPending}
        placeholder={'title,source_url,price_text,location_text,state,city\nLoja comercial,https://facebook.com/marketplace/item/123,R$ 4.000,Boa Viagem,PE,Recife'}
        className="min-h-36"
      />

      {state.errors?.csv && (
        <p className="text-xs text-destructive">{state.errors.csv[0]}</p>
      )}
      {state.errors?.general && (
        <p className="text-xs text-destructive">{state.errors.general[0]}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
        Import CSV
      </Button>
    </form>
  )
}
