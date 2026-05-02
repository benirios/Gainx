import type { Database, Json } from '@/types/supabase'
import { Circle, Eye, FileText, NotebookText, Send } from 'lucide-react'

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

function activityIcon(eventType: string) {
  switch (eventType) {
    case 'om_sent':
      return { Icon: Send, className: 'bg-[#e7faf8] text-[#249c96]' }
    case 'om_opened':
      return { Icon: Eye, className: 'bg-[#eaf3ff] text-[#497db7]' }
    case 'note_added':
      return { Icon: NotebookText, className: 'bg-[#f0eeff] text-[#6759c7]' }
    case 'file_uploaded':
      return { Icon: FileText, className: 'bg-[#eaf3ff] text-[#497db7]' }
    default:
      return { Icon: Circle, className: 'bg-muted text-muted-foreground' }
  }
}

export function ActivityLogSection({ activities }: { activities: ActivityRow[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(35,45,72,0.05)] md:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Circle className="size-4" />
        </span>
        <h2 className="text-[15px] font-medium text-foreground">Activity</h2>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => {
            const { Icon, className } = activityIcon(activity.event_type)

            return (
              <div
                key={activity.id}
                className="flex min-h-12 flex-col gap-2 rounded-lg border border-border/70 bg-[#fbfcfe] px-4 py-3 transition-colors hover:bg-[#f8fafc] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${className}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm text-foreground">{activityDescription(activity)}</span>
                </div>
                <time className="text-xs text-muted-foreground sm:shrink-0" dateTime={activity.created_at ?? undefined}>
                  {formatTimestamp(activity.created_at)}
                </time>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
