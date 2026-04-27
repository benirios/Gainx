'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="w-full justify-start gap-2 text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
    >
      <LogOut className="size-4" />
      Log out
    </Button>
  )
}
