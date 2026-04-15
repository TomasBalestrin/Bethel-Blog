import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ProfileForm, type ProfileInitialData } from '@/components/admin/ProfileForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Configurações — Admin Bethel Blog',
  robots: { index: false, follow: false },
}

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin/settings')

  const { data: profile, error } = await supabase
    .from('profile')
    .select('name, avatar_url, bio, blog_title, blog_description')
    .eq('id', user.id)
    .maybeSingle<ProfileInitialData>()
  if (error) {
    console.error('[/admin/settings]', error)
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Profile não encontrado. Rode o INSERT manual descrito em
          <code className="mx-1 rounded bg-muted px-1">schema.md §11</code>
          usando o UUID do seu usuário.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Edite seu perfil público e as informações do blog.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}
