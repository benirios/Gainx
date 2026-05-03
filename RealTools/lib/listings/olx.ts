import { chromium } from 'playwright'
import type { ListingDraft } from '@/lib/schemas/listing'

export type OlxTarget = {
  state?: string
  city?: string
  region?: string
  address?: string
  searchTerm: string
  maxListings?: number
}

const DEFAULT_MAX_LISTINGS = 25
const HARD_MAX_LISTINGS = 50
const OLX_BASE_URL = 'https://www.olx.com.br'

function normalizeLimit(maxListings?: number) {
  if (!maxListings || Number.isNaN(maxListings)) return DEFAULT_MAX_LISTINGS
  return Math.min(Math.max(Math.trunc(maxListings), 1), HARD_MAX_LISTINGS)
}

function toAbsoluteUrl(url: string | null | undefined) {
  if (!url) return null
  try {
    return new URL(url, OLX_BASE_URL).toString()
  } catch {
    return null
  }
}

function compactText(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() || undefined
}

export function buildOlxSearchUrl(target: OlxTarget) {
  const query = [
    target.searchTerm,
    target.address,
    target.region,
    target.city,
    target.state,
  ]
    .filter(Boolean)
    .join(' ')

  const params = new URLSearchParams({
    q: query,
  })

  return `${OLX_BASE_URL}/imoveis?${params.toString()}`
}

export async function scrapeOlxListings(target: OlxTarget): Promise<ListingDraft[]> {
  const maxListings = normalizeLimit(target.maxListings)
  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    })

    await page.goto(buildOlxSearchUrl(target), {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    })

    const rawCards = await page.evaluate((limit) => {
      const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/item/"], a[href*="olx.com.br"]'))
      const seen = new Set<string>()

      return anchors
        .map((anchor) => {
          const href = anchor.href
          if (!href || seen.has(href)) return null
          seen.add(href)

          const container = anchor.closest('section, article, li, div') ?? anchor
          const text = container.textContent?.replace(/\s+/g, ' ').trim() ?? ''
          const title =
            anchor.getAttribute('title') ||
            anchor.getAttribute('aria-label') ||
            container.querySelector('h2, h3')?.textContent ||
            anchor.textContent
          const price = text.match(/R\$\s?[\d.,]+/)?.[0]
          const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'))
            .map((img) => img.currentSrc || img.src)
            .filter(Boolean)

          return {
            href,
            title: title?.replace(/\s+/g, ' ').trim() ?? '',
            price,
            location: text,
            images,
          }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item?.href && item.title))
        .slice(0, limit)
    }, maxListings)

    const drafts: ListingDraft[] = []

    for (const raw of rawCards) {
      const sourceUrl = toAbsoluteUrl(raw.href)
      if (!sourceUrl) continue

      let description: string | undefined
      let addressText: string | undefined

      try {
        const detail = await browser.newPage()
        await detail.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 12000 })
        const detailText = await detail.evaluate(() => document.body.textContent?.replace(/\s+/g, ' ').trim() ?? '')
        description = compactText(detailText.slice(0, 2000))
        addressText = compactText(
          detailText.match(/(?:Endere[cç]o|Localiza[cç][aã]o)\s*:?\s*([^|]{8,160})/i)?.[1]
        )
        await detail.close()
      } catch {
        // Detail extraction is best-effort; search-card data is still useful for the MVP.
      }

      drafts.push({
        source: 'olx',
        sourceUrl,
        title: compactText(raw.title) ?? 'OLX listing',
        description,
        priceText: compactText(raw.price),
        locationText: compactText(raw.location),
        addressText,
        country: 'BR',
        state: target.state,
        city: target.city ?? target.region,
        images: raw.images
          .map((image) => toAbsoluteUrl(image))
          .filter((image): image is string => Boolean(image)),
        rawPayload: {
          ...raw,
          requestedAddress: target.address,
          requestedRegion: target.region,
          requestedCity: target.city,
          requestedState: target.state,
        },
      })
    }

    return drafts
  } finally {
    await browser.close()
  }
}
