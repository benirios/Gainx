import Image from 'next/image'
import { SidebarNav } from './sidebar-nav'
import { LogoutButton } from './logout-button'

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <div className="border-b border-sidebar-border px-4 py-5">
        <div className="space-y-2">
          <Image
            src="/realtools-logo.png"
            alt="RealTools"
            width={170}
            height={97}
            priority
            className="h-12 w-auto object-contain"
          />
          <p className="text-xs text-muted-foreground">Deal workspace</p>
        </div>
      </div>
      <SidebarNav />
      <div className="border-t border-sidebar-border px-3 pb-4 pt-3">
        <LogoutButton />
      </div>
    </aside>
  )
}
