'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  Tag,
  type LucideIcon,
  FileText,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils/cn'
import { useAdminUIStore } from '@/stores/adminUIStore'

export interface SidebarProfile {
  name: string
  avatar_url: string
}

interface AdminSidebarProps {
  profile: SidebarProfile | null
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/categories', label: 'Categorias', icon: Tag },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
]

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const sidebarOpen = useAdminUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useAdminUIStore((state) => state.setSidebarOpen)

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden border-r border-border bg-card md:flex md:flex-col">
        <SidebarContent profile={profile} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 overflow-hidden p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu admin</SheetTitle>
          </SheetHeader>
          <SidebarContent profile={profile} onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

interface SidebarContentProps {
  profile: SidebarProfile | null
  onNavigate?: () => void
}

function SidebarContent({ profile, onNavigate }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="text-sm font-extrabold tracking-tight"
        >
          Bethel Blog
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            Admin
          </span>
        </Link>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Navegação admin"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <SidebarFooter profile={profile} />
    </div>
  )
}

function SidebarFooter({ profile }: { profile: SidebarProfile | null }) {
  const name = profile?.name ?? 'Bethel'
  const avatarUrl = profile?.avatar_url
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="mt-auto shrink-0 border-t border-border p-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {initial}
            </div>
          )}
          <span className="truncate text-sm font-medium">{name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/" target="_blank" rel="noopener">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver site
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action="/api/auth/signout" method="post" className="w-full">
              <button
                type="submit"
                className="flex w-full items-center text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
