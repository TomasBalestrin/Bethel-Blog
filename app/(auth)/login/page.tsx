import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Skeleton } from '@/components/ui/skeleton'

import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Entrar — Bethel Blog',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2 text-center">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          Bethel Blog
        </Link>
        <p className="text-sm text-muted-foreground">Área administrativa</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  )
}
