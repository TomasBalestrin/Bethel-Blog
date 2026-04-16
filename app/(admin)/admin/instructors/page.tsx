import type { Metadata } from 'next'

import { InstructorsTable } from '@/components/admin/InstructorsTable'
import { createClient } from '@/lib/supabase/server'
import type { Instructor } from '@/types/instructor'

export const metadata: Metadata = {
  title: 'Instrutores — Admin Bethel Blog',
  robots: { index: false, follow: false },
}

export default async function AdminInstructorsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('instructors')
    .select('id, name, slug, avatar_url, bio, created_at, updated_at')
    .order('name', { ascending: true })

  if (error) {
    console.error('[/admin/instructors]', error)
  }

  const instructors = (data ?? []) as Instructor[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Instrutores</h1>
        <p className="text-sm text-muted-foreground">
          {instructors.length}{' '}
          {instructors.length === 1 ? 'instrutor' : 'instrutores'} — gerencie
          quem assina os artigos.
        </p>
      </div>
      <InstructorsTable data={instructors} />
    </div>
  )
}
