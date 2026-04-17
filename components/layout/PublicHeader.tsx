import Image from 'next/image'
import Link from 'next/link'

import { SearchBar } from '@/components/shared/SearchBar'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { createClient } from '@/lib/supabase/server'

import { MobileNav } from './MobileNav'

export async function PublicHeader() {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profile')
    .select('name, avatar_url, blog_title')
    .limit(1)
    .maybeSingle<{ name: string; avatar_url: string; blog_title: string }>()

  const blogTitle = profile?.blog_title ?? 'Bethel Blog'
  const authorName = profile?.name ?? 'Bethel'
  const avatarUrl = profile?.avatar_url

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 w-full bg-background">
        {/* Row 1 */}
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <Link href="/" aria-label={`Ir para a home de ${blogTitle}`} className="shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={authorName} width={36} height={36} className="h-9 w-9 rounded-xl object-cover" priority />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1 text-center">
            <Link href="/" className="font-serif text-xl font-normal tracking-tight md:text-2xl">
              {blogTitle}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <SearchBar />
            <ThemeToggle />
            <div className="md:hidden">
              <MobileNav blogTitle={blogTitle} />
            </div>
          </div>
        </div>

        {/* Full-width separator */}
        <div className="border-t border-border" />

        {/* Row 2: nav */}
        <nav aria-label="Navegação principal" className="hidden md:block">
          <div className="mx-auto flex max-w-7xl justify-center gap-8 px-6 py-2.5">
            <Link href="/" className="pb-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Início
            </Link>
            <Link href="/artigos" className="pb-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Artigos
            </Link>
          </div>
        </nav>

        {/* Full-width bottom separator */}
        <div className="border-t border-border" />
      </header>
    </>
  )
}
