'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SearchBarProps {
  initialQuery?: string
  inline?: boolean
}

export function SearchBar({ initialQuery = '', inline = false }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar posts..."
        aria-label="Buscar posts"
        autoFocus={!inline}
        className="h-9"
      />
      <Button type="submit" size="sm" disabled={!query.trim()}>
        Buscar
      </Button>
    </form>
  )

  if (inline) {
    return form
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir busca">
          <Search />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        {form}
      </PopoverContent>
    </Popover>
  )
}
