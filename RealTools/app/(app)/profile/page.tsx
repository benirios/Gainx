import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account details.
        </p>
      </div>

      <div className="max-w-xl rounded-lg border border-border bg-card p-6 space-y-4 shadow-[0_12px_30px_rgba(35,45,72,0.05)]">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email
          </p>
          <p className="text-sm text-foreground">{user?.email ?? 'unknown'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            User ID
          </p>
          <p className="text-xs text-muted-foreground font-mono break-all">{user?.id ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
