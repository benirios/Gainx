import { SidebarNav } from './sidebar-nav'
import { LogoutButton } from './logout-button'

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <div className="border-b border-sidebar-border px-4 py-5">
        <span className="text-lg font-semibold text-sidebar-accent-foreground">
          RealTools
        </span>
        <p className="mt-1 text-xs text-muted-foreground">Deal workspace</p>
      </div>
      <SidebarNav />
      <div className="border-t border-sidebar-border px-3 pb-4 pt-3">
        <LogoutButton />
      </div>
    </aside>
  )
}
