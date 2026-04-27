import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-xl font-semibold text-zinc-50">
        Profile
      </h1>
      <p className="text-base text-zinc-400 mt-2">
        Signed in as {user?.email ?? 'unknown'}
      </p>
    </div>
  )
}
