'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { completeImportRun, failImportRun, startImportRun } from '@/lib/listings/import-runs'
import { upsertListing, upsertListingImportTarget } from '@/lib/listings/ingestion'
import { scrapeOlxListings } from '@/lib/listings/olx'
import { DEFAULT_LISTING_IMPORT_TARGETS } from '@/lib/listings/constants'
import type { Database } from '@/types/supabase'

type ListingImportTargetRow = Database['public']['Tables']['listing_import_targets']['Row']

export type ImportActionResult = {
  ok: boolean
  message: string
}

export type OlxSearchImportState = {
  errors?: {
    locationQuery?: string[]
    searchTerm?: string[]
    general?: string[]
  }
  message?: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown import error'
}

export async function runOlxSearchImportAction(
  _prevState: OlxSearchImportState,
  formData: FormData
): Promise<OlxSearchImportState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const locationQuery = String(formData.get('locationQuery') ?? '').trim()
  const searchTerm = String(formData.get('searchTerm') ?? '').trim() || 'ponto comercial'
  const state = String(formData.get('state') ?? '').trim().toUpperCase()
  const maxListingsRaw = Number(formData.get('maxListings') ?? 25)
  const maxListings = Number.isFinite(maxListingsRaw)
    ? Math.min(Math.max(Math.trunc(maxListingsRaw), 1), 50)
    : 25

  if (locationQuery.length < 2) {
    return { errors: { locationQuery: ['Enter an address, city, or region.'] } }
  }

  if (searchTerm.length < 2) {
    return { errors: { searchTerm: ['Enter a search term.'] } }
  }

  const { data: run, error: runError } = await startImportRun(supabase, user.id, {
    source: 'olx',
    metadata: {
      importType: 'on_demand_search',
      locationQuery,
      state,
      searchTerm,
      maxListings,
    },
  })

  if (runError || !run) {
    return { errors: { general: ['Failed to start import run.'] } }
  }

  try {
    const listings = await scrapeOlxListings({
      searchTerm,
      region: locationQuery,
      city: locationQuery,
      state: state || undefined,
      maxListings,
    })

    let createdCount = 0
    let failedCount = 0
    const failures: string[] = []

    for (const listing of listings) {
      const { error } = await upsertListing(supabase, user.id, listing)
      if (error) {
        failedCount += 1
        failures.push(`${listing.sourceUrl}: ${error.message ?? 'upsert failed'}`)
      } else {
        createdCount += 1
      }
    }

    await completeImportRun(
      supabase,
      run.id,
      user.id,
      {
        createdCount,
        updatedCount: 0,
        skippedCount: 0,
        failedCount,
      },
      {
        source: 'olx',
        importType: 'on_demand_search',
        locationQuery,
        state,
        searchTerm,
        successfulUpserts: createdCount,
        note: 'On-demand OLX import records successful upserts; insert vs update split is not distinguished by Supabase upsert result.',
        failures: failures.slice(0, 10),
      }
    )

    revalidatePath('/listings/import')
    return { message: `OLX search finished: ${createdCount} saved, ${failedCount} failed.` }
  } catch (error) {
    const message = getErrorMessage(error)
    await failImportRun(supabase, run.id, user.id, message, {
      source: 'olx',
      importType: 'on_demand_search',
      locationQuery,
      state,
      searchTerm,
    })
    revalidatePath('/listings/import')
    return { errors: { general: [message] } }
  }
}

export async function runOlxImportAction(targetId: string): Promise<ImportActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: target } = await (supabase.from('listing_import_targets') as any)
    .select('*')
    .eq('id', targetId)
    .eq('user_id', user.id)
    .eq('source', 'olx')
    .eq('is_active', true)
    .single() as { data: ListingImportTargetRow | null }

  if (!target) {
    return { ok: false, message: 'Import target not found or inactive.' }
  }

  const { data: run, error: runError } = await startImportRun(supabase, user.id, {
    source: 'olx',
    targetId: target.id,
    metadata: {
      state: target.state,
      city: target.city,
      searchTerm: target.search_term,
    },
  })

  if (runError || !run) {
    return { ok: false, message: 'Failed to start import run.' }
  }

  try {
    const listings = await scrapeOlxListings({
      state: target.state,
      city: target.city,
      searchTerm: target.search_term,
      maxListings: 25,
    })

    let createdCount = 0
    let failedCount = 0
    const failures: string[] = []

    for (const listing of listings) {
      const { error } = await upsertListing(supabase, user.id, listing)
      if (error) {
        failedCount += 1
        failures.push(`${listing.sourceUrl}: ${error.message ?? 'upsert failed'}`)
      } else {
        createdCount += 1
      }
    }

    await completeImportRun(
      supabase,
      run.id,
      user.id,
      {
        createdCount,
        updatedCount: 0,
        skippedCount: 0,
        failedCount,
      },
      {
        targetId: target.id,
        source: 'olx',
        successfulUpserts: createdCount,
        note: 'Phase 11 records successful upserts; insert vs update split is not distinguished by Supabase upsert result.',
        failures: failures.slice(0, 10),
      }
    )

    revalidatePath('/listings/import')

    return {
      ok: failedCount === 0,
      message: `OLX import finished: ${createdCount} saved, ${failedCount} failed.`,
    }
  } catch (error) {
    const message = getErrorMessage(error)
    await failImportRun(supabase, run.id, user.id, message, {
      targetId: target.id,
      source: 'olx',
    })
    revalidatePath('/listings/import')
    return { ok: false, message }
  }
}

export async function seedDefaultImportTargetsAction(): Promise<ImportActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let saved = 0

  for (const target of DEFAULT_LISTING_IMPORT_TARGETS) {
    const { error } = await upsertListingImportTarget(supabase, user.id, target)
    if (!error) saved += 1
  }

  revalidatePath('/listings/import')

  return {
    ok: saved > 0,
    message: saved > 0 ? `${saved} default targets ready.` : 'No default targets were saved.',
  }
}
