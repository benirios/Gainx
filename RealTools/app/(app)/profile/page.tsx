import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      {/* Page header — D-02: serif title, muted support copy */}
      <div className="mb-8">
        <h1 className="font-heading text-[28px] font-semibold leading-tight text-foreground">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account details.
        </p>
      </div>

      {/* Account info card */}
      <div className="max-w-md rounded-lg border border-border bg-card p-6 space-y-4">
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
