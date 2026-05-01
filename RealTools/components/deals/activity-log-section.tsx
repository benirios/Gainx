import type { Database, Json } from '@/types/supabase'

type ActivityRow = Database['public']['Tables']['activities']['Row']

function metadataValue(metadata: Json | null, key: string) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null

  const value = metadata[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function formatTimestamp(value: string | null) {
  if (!value) return 'Unknown time'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function activityDescription(activity: ActivityRow) {
  const buyerName = metadataValue(activity.metadata, 'buyer_name')
  const fileName = metadataValue(activity.metadata, 'file_name')

  switch (activity.event_type) {
    case 'om_sent':
      return buyerName ? `OM sent to ${buyerName}` : 'OM sent'
    case 'om_opened':
      return buyerName ? `OM opened by ${buyerName}` : 'OM opened'
    case 'note_added':
      return 'Note added'
    case 'file_uploaded':
      return fileName ? `File uploaded: ${fileName}` : 'File uploaded'
    default:
      return activity.event_type.replaceAll('_', ' ')
  }
}

export function ActivityLogSection({ activities }: { activities: ActivityRow[] }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-50 mb-4">Activity</h2>

      {activities.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">No activity yet.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between gap-4 bg-zinc-800/50 rounded-lg px-4 py-3 min-h-[44px]"
            >
              <span className="text-base text-zinc-50">{activityDescription(activity)}</span>
              <time className="text-sm text-zinc-400 shrink-0" dateTime={activity.created_at ?? undefined}>
                {formatTimestamp(activity.created_at)}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
