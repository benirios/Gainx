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
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon, matchPrefixes }) => {
        const isActive = matchPrefixes.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        )
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-md text-sm min-h-[44px] transition-colors',
              isActive
                ? 'bg-muted border border-border text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
