'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { buildOmEmailHtml, buildOmEmailText } from '@/lib/email/om-email'
import { createResendClient } from '@/lib/resend'
import type { Database } from '@/types/supabase'

type DealRow = Database['public']['Tables']['deals']['Row']
type BuyerRow = Database['public']['Tables']['buyers']['Row']
type DealBuyerRow = Database['public']['Tables']['deal_buyers']['Row']

export type SendOmState = {
  success?: boolean
  errors?: {
    buyerIds?: string[]
    dealId?: string[]
    general?: string[]
  }
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

function parseBuyerIds(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

export async function sendOmAction(
  _prevState: SendOmState,
  formData: FormData
): Promise<SendOmState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dealId = formData.get('dealId')
  const buyerIds = parseBuyerIds(formData.get('buyerIds'))

  if (typeof dealId !== 'string' || !dealId) {
    return { errors: { dealId: ['Missing deal.'] } }
  }

  if (buyerIds.length === 0) {
    return { errors: { buyerIds: ['Select at least one buyer.'] } }
  }

  if (!process.env.RESEND_API_KEY) {
    return { errors: { general: ['Missing RESEND_API_KEY. Add it before sending OM emails.'] } }
  }

  const resend = createResendClient()
  if (!resend) {
    return { errors: { general: ['Missing RESEND_API_KEY. Add it before sending OM emails.'] } }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deal } = await (supabase.from('deals') as any)
    .select('*')
    .eq('id', dealId)
    .eq('user_id', user.id)
    .single() as { data: DealRow | null }

  if (!deal) {
    return { errors: { general: ['Deal not found.'] } }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: buyers } = await (supabase.from('buyers') as any)
    .select('*')
    .eq('user_id', user.id)
    .in('id', buyerIds) as { data: BuyerRow[] | null }

  const selectedBuyers = buyers ?? []
  if (selectedBuyers.length !== buyerIds.length) {
    return { errors: { general: ['One or more selected buyers could not be found.'] } }
  }

  const associationRows = selectedBuyers.map((buyer) => ({
    deal_id: deal.id,
    buyer_id: buyer.id,
  }))

  // Create missing associations while preserving existing tracking tokens on re-send.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dealBuyers, error: upsertError } = await (supabase.from('deal_buyers') as any)
    .upsert(associationRows, { onConflict: 'deal_id,buyer_id', ignoreDuplicates: false })
    .select('deal_id, buyer_id, tracking_token, om_sent_at') as {
      data: Pick<DealBuyerRow, 'deal_id' | 'buyer_id' | 'tracking_token' | 'om_sent_at'>[] | null
      error: unknown
    }

  if (upsertError || !dealBuyers) {
    return { errors: { general: ['Failed to prepare recipients. Please try again.'] } }
  }

  const tokenByBuyerId = new Map(dealBuyers.map((row) => [row.buyer_id, row.tracking_token]))
  const baseUrl = getBaseUrl().replace(/\/$/, '')
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const payloads = selectedBuyers.map((buyer) => {
    const token = tokenByBuyerId.get(buyer.id)
    const omUrl = `${baseUrl}/om/${deal.id}?ref=${token}`

    return {
      from,
      to: [buyer.email],
      subject: `${deal.title} - Offering Memorandum`,
      html: buildOmEmailHtml({
        buyerName: buyer.name,
        dealTitle: deal.title,
        dealAddress: deal.address,
        omUrl,
      }),
      text: buildOmEmailText({
        buyerName: buyer.name,
        dealTitle: deal.title,
        dealAddress: deal.address,
        omUrl,
      }),
    }
  })

  const { error: sendError } = await resend.batch.send(payloads)
  if (sendError) {
    return { errors: { general: ['Failed to send OM emails. Please try again.'] } }
  }

  const sentAt = new Date().toISOString()
  const serviceClient = createSupabaseServiceClient()

  await Promise.all(
    selectedBuyers.map(async (buyer) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('deal_buyers') as any)
        .update({ om_sent_at: sentAt })
        .eq('deal_id', deal.id)
        .eq('buyer_id', buyer.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (serviceClient.from('activities') as any).insert({
        deal_id: deal.id,
        event_type: 'om_sent',
        metadata: {
          buyer_id: buyer.id,
          buyer_name: buyer.name,
          buyer_email: buyer.email,
        },
      })
    })
  )

  revalidatePath(`/deals/${deal.id}`)
  return { success: true }
}
