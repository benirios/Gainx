import 'server-only'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { Database } from '@/types/supabase'

type DealBuyerRow = Database['public']['Tables']['deal_buyers']['Row']
type BuyerRow = Database['public']['Tables']['buyers']['Row']

/**
 * Idempotent OM open recorder.
 *
 * Behavior:
 *  - Unknown token → no-op (returns without error).
 *  - First valid open → sets om_opened_at + inserts om_opened activity.
 *  - Repeat open → no duplicate activity (om_opened_at already set, guard skips).
 *
 * Used by both primary URL path (OM Server Component) and secondary pixel path
 * (/api/track/[token] Route Handler). Both paths call this single function to
 * guarantee idempotency regardless of which path fires first.
 *
 * Security: always completes without revealing whether the token was valid
 * (T-03-08: no information leakage via response difference).
 */
export async function recordOmOpenByToken(token: string): Promise<void> {
  if (!token) return

  const supabase = createSupabaseServiceClient()

  // Look up the deal_buyers row by tracking token
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dealBuyer } = await (supabase.from('deal_buyers') as any)
    .select('deal_id, buyer_id, om_opened_at')
    .eq('tracking_token', token)
    .single() as { data: Pick<DealBuyerRow, 'deal_id' | 'buyer_id' | 'om_opened_at'> | null }

  // Unknown token — no-op (T-03-08: do not reveal token validity)
  if (!dealBuyer) return

  // Idempotency guard: only record on first open (T-03-09)
  if (dealBuyer.om_opened_at) return

  // Record the open timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('deal_buyers') as any)
    .update({ om_opened_at: new Date().toISOString() })
    .eq('tracking_token', token)

  // Fetch buyer metadata for the activity event (D-09)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: buyer } = await (supabase.from('buyers') as any)
    .select('name, email')
    .eq('id', dealBuyer.buyer_id)
    .single() as { data: Pick<BuyerRow, 'name' | 'email'> | null }

  // Insert om_opened activity event (D-09: metadata stores buyer_id/name/email)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('activities') as any).insert({
    deal_id: dealBuyer.deal_id,
    event_type: 'om_opened',
    metadata: {
      buyer_id: dealBuyer.buyer_id,
      buyer_name: buyer?.name ?? null,
      buyer_email: buyer?.email ?? null,
    },
  })
}
