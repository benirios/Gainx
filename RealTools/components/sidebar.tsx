import { SidebarNav } from './sidebar-nav'
import { LogoutButton } from './logout-button'

export function Sidebar() {
  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <span className="text-xl font-semibold text-sidebar-foreground tracking-wide">RealTools</span>
      </div>
      <SidebarNav />
      <div className="px-3 pb-6 pt-4 border-t border-sidebar-border">
        <LogoutButton />
      </div>
    </aside>
  )
}
