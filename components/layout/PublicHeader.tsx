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
      {/* Skip link (fica invisível até receber foco via teclado) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
        <Link
          href="/"
          aria-label={`Ir para a home de ${blogTitle}`}
          className="flex shrink-0 items-center"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={authorName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex flex-1 items-center justify-center gap-6">
          <Link
            href="/"
            className="truncate text-lg font-extrabold tracking-tight"
          >
            {blogTitle}
          </Link>
          <nav aria-label="Navegação principal" className="hidden md:block">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Início
            </Link>
          </nav>
        </div>

          <div className="flex shrink-0 items-center gap-1">
            <SearchBar />
            <ThemeToggle />
            <div className="md:hidden">
              <MobileNav blogTitle={blogTitle} />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
