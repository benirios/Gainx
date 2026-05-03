import { ListingDraftSchema, type ListingDraft } from '@/lib/schemas/listing'

const REQUIRED_HEADERS = ['title', 'source_url'] as const

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function splitImages(value: string | undefined) {
  if (!value) return []
  return value
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseManualListingCsv(input: string): ListingDraft[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one listing row.')
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase())
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(`CSV missing required header(s): ${missingHeaders.join(', ')}`)
  }

  return lines.slice(1).map((line, rowIndex) => {
    const values = parseCsvLine(line)
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || undefined]))

    const parsed = ListingDraftSchema.safeParse({
      source:       'facebook_manual',
      sourceUrl:    row.source_url,
      title:        row.title,
      description:  row.description,
      priceText:    row.price_text,
      locationText: row.location_text,
      addressText:  row.address_text,
      country:      'BR',
      state:        row.state,
      city:         row.city,
      neighborhood: row.neighborhood,
      images:       splitImages(row.images),
      rawPayload:   row,
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid row'
      throw new Error(`CSV row ${rowIndex + 2}: ${firstError}`)
    }

    return parsed.data
  })
}
