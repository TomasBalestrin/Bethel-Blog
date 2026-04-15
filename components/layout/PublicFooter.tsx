import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export async function PublicFooter() {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profile')
    .select('blog_title')
    .limit(1)
    .maybeSingle<{ blog_title: string }>()

  const blogTitle = profile?.blog_title ?? 'Bethel Blog'
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          © {year} {blogTitle}
        </p>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-6 text-sm">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sobre
          </Link>
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Arquivo
          </Link>
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Mapa do site
          </Link>
        </nav>
      </div>
    </footer>
  )
}
