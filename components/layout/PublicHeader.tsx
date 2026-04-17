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

      <header className="sticky top-0 z-40 bg-background">
        <div className="container">
          {/* Row 1: avatar + title + icons */}
          <div className="flex items-center gap-4 py-4">
            <Link
              href="/"
              aria-label={`Ir para a home de ${blogTitle}`}
              className="shrink-0"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={authorName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl object-cover"
                  priority
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            <div className="flex-1 text-center">
              <Link href="/" className="font-serif text-2xl font-normal tracking-tight md:text-[28px]">
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

          {/* Row 2: nav tabs */}
          <nav aria-label="Navegação principal" className="hidden border-t border-border md:flex md:justify-center md:gap-8 md:py-3">
            <Link
              href="/"
              className="border-b-2 border-foreground pb-2 text-sm font-medium"
            >
              Início
            </Link>
          </nav>
        </div>

        {/* Bottom separator */}
        <div className="border-b border-border" />
      </header>
    </>
  )
}
