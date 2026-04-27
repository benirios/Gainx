import { SidebarNav } from './sidebar-nav'
import { LogoutButton } from './logout-button'

export function Sidebar() {
  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="px-6 py-6 border-b border-zinc-800">
        <span className="text-xl font-semibold text-zinc-50">RealTools</span>
      </div>
      <SidebarNav />
      <div className="px-3 pb-6 pt-4 border-t border-zinc-800">
        <LogoutButton />
      </div>
    </aside>
  )
}
