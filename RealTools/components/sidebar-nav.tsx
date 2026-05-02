'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Deals', icon: Briefcase, matchPrefixes: ['/dashboard', '/deals'] },
  { href: '/buyers', label: 'Buyers', icon: Users, matchPrefixes: ['/buyers'] },
  { href: '/profile', label: 'Profile', icon: User, matchPrefixes: ['/profile'] },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map(({ href, label, icon: Icon, matchPrefixes }) => {
        const isActive = matchPrefixes.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        )
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
              isActive
                ? 'border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_8px_18px_rgba(35,45,72,0.04)]'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="size-4" />
            </span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
