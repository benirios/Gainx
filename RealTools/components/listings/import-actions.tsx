'use client'

import { useActionState, useEffect, useRef, useTransition } from 'react'
import { Loader2, Play, Search, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { runOlxImportAction, runOlxSearchImportAction, seedDefaultImportTargetsAction, type OlxSearchImportState } from '@/lib/actions/listing-import-actions'

const initialOlxSearchImportState: OlxSearchImportState = {}

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

export function OlxSearchImportForm() {
  const [state, formAction, isPending] = useActionState(runOlxSearchImportAction, initialOlxSearchImportState)
  const previousPending = useRef(false)

  useEffect(() => {
    if (previousPending.current && !isPending && state.message && !state.errors) {
      toast.success(state.message)
    }
    previousPending.current = isPending
  }, [isPending, state])

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Search OLX Now</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter an address, city, or region and RealTools will scrape matching OLX property listings on request.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_120px_120px]">
        <div className="space-y-2">
          <Label htmlFor="locationQuery">Address, city, or region</Label>
          <Input
            id="locationQuery"
            name="locationQuery"
            disabled={isPending}
            placeholder="Boa Viagem, Recife"
            required
          />
          {state.errors?.locationQuery && (
            <p className="text-xs text-destructive">{state.errors.locationQuery[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="searchTerm">Search term</Label>
          <Input
            id="searchTerm"
            name="searchTerm"
            disabled={isPending}
            defaultValue="ponto comercial"
            placeholder="loja, sala comercial, galpao"
            required
          />
          {state.errors?.searchTerm && (
            <p className="text-xs text-destructive">{state.errors.searchTerm[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            disabled={isPending}
            placeholder="PE"
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxListings">Max</Label>
          <Input
            id="maxListings"
            name="maxListings"
            type="number"
            min={1}
            max={50}
            defaultValue={25}
            disabled={isPending}
          />
        </div>
      </div>

      {state.errors?.general && (
        <p className="text-xs text-destructive">{state.errors.general[0]}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
        Search and import
      </Button>
    </form>
  )
}
