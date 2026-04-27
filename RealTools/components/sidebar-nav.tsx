'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Deals', icon: Briefcase, matchPrefix: '/dashboard' },
  { href: '/buyers', label: 'Buyers', icon: Users, matchPrefix: '/buyers' },
  { href: '/profile', label: 'Profile', icon: User, matchPrefix: '/profile' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon, matchPrefix }) => {
        const isActive = pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-md text-base min-h-[44px] transition-colors',
              isActive
                ? 'bg-zinc-800 text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800'
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
