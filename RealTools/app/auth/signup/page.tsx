import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SignUpForm } from './signup-form'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-50 text-center mb-8">
          RealTools
        </h1>
        <Card className="border-border bg-card">
          <CardHeader>
            <h2 className="text-xl font-semibold text-zinc-50 text-center">
              Create your account
            </h2>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <p className="text-sm text-zinc-400 text-center mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-zinc-50 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
