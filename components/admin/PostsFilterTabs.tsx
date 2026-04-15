'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/useDebounce'

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published' | 'archived'

const TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'published', label: 'Publicados' },
  { value: 'archived', label: 'Arquivados' },
]

interface PostsFilterTabsProps {
  currentStatus: StatusFilter
  currentQuery: string
}

export function PostsFilterTabs({ currentStatus, currentQuery }: PostsFilterTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(currentQuery)
  const debouncedQuery = useDebounce(query, 300)

  // Mantém sincronizado quando usuário usa back/forward.
  useEffect(() => {
    setQuery(currentQuery)
  }, [currentQuery])

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') next.delete(key)
        else next.set(key, value)
      }
      next.delete('page') // reseta paginação ao filtrar
      const queryString = next.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname)
    },
    [pathname, router, searchParams]
  )

  // Dispara update de URL quando o debounce estabiliza.
  useEffect(() => {
    if (debouncedQuery === currentQuery) return
    updateParams({ q: debouncedQuery || null })
  }, [debouncedQuery, currentQuery, updateParams])

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Tabs
        value={currentStatus}
        onValueChange={(value) =>
          updateParams({ status: value === 'all' ? null : value })
        }
      >
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative w-full md:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título..."
          className="pl-9"
        />
      </div>
    </div>
  )
}
