import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  // ALWAYS getUser() — defense in depth even though middleware also checks (CLAUDE.md rule).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card/80 px-4 backdrop-blur md:px-6 lg:px-8 flex shrink-0 items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              RealTools
            </p>
            <p className="text-sm font-medium text-foreground">Workspace</p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
