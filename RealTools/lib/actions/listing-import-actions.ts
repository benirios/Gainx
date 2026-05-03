'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { completeImportRun, failImportRun, startImportRun } from '@/lib/listings/import-runs'
import { upsertListing } from '@/lib/listings/ingestion'
import { scrapeOlxListings } from '@/lib/listings/olx'
import { parseManualListingCsv } from '@/lib/listings/csv'
import type { Database } from '@/types/supabase'

type ListingImportTargetRow = Database['public']['Tables']['listing_import_targets']['Row']

export type ImportActionResult = {
  ok: boolean
  message: string
}

export type ManualImportState = {
  errors?: {
    csv?: string[]
    general?: string[]
  }
  message?: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown import error'
}

export async function importManualListingsAction(
  _prevState: ManualImportState,
  formData: FormData
): Promise<ManualImportState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const csv = String(formData.get('csv') ?? '').trim()
  if (!csv) {
    return { errors: { csv: ['Paste CSV content before importing.'] } }
  }

  const { data: run, error: runError } = await startImportRun(supabase, user.id, {
    source: 'facebook_manual',
    metadata: { importType: 'csv' },
  })

  if (runError || !run) {
    return { errors: { general: ['Failed to start import run.'] } }
  }

  try {
    const listings = parseManualListingCsv(csv)
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
        source: 'facebook_manual',
        successfulUpserts: createdCount,
        failures: failures.slice(0, 10),
      }
    )

    revalidatePath('/listings/import')
    return { message: `Manual import finished: ${createdCount} saved, ${failedCount} failed.` }
  } catch (error) {
    const message = getErrorMessage(error)
    await failImportRun(supabase, run.id, user.id, message, {
      source: 'facebook_manual',
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
