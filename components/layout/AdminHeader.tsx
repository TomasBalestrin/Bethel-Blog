'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdminUIStore } from '@/stores/adminUIStore'

const LABELS: Record<string, string> = {
  admin: 'Dashboard',
  posts: 'Posts',
  categories: 'Categorias',
  settings: 'Configurações',
  new: 'Novo',
  edit: 'Editar',
}

function segmentLabel(segment: string): string {
  return LABELS[segment] ?? segment
}

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return []

  const crumbs: { label: string; href: string }[] = []
  let href = ''
  for (const part of parts) {
    href += `/${part}`
    // Ignora IDs dinâmicos (UUID ou números).
    if (/^[0-9a-f-]{16,}$/i.test(part) || /^\d+$/.test(part)) continue
    crumbs.push({ label: segmentLabel(part), href })
  }
  return crumbs
}

export function AdminHeader() {
  const pathname = usePathname()
  const toggleSidebar = useAdminUIStore((state) => state.toggleSidebar)
  const crumbs = buildBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Abrir menu admin"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <Fragment key={crumb.href}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                )}
                <li
                  className={
                    isLast ? 'truncate font-medium text-foreground' : 'truncate'
                  }
                >
                  {crumb.label}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </nav>

      {/* Slot pra ações stickies da página (ex: Salvar/Publicar no editor).
          Páginas podem injetar conteúdo via portal neste div. */}
      <div id="admin-header-actions" className="flex items-center gap-2" />
    </header>
  )
}
