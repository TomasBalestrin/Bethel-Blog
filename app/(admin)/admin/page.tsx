import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — Bethel Blog',
  robots: { index: false, follow: false },
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Stats e atalhos virão nas próximas tasks.
      </p>
    </div>
  )
}
