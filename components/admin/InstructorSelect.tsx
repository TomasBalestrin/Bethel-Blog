'use client'

import Link from 'next/link'
import { ExternalLink, UserCircle2 } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'

export interface InstructorOption {
  id: string
  name: string
  slug: string
  avatar_url: string
}

interface InstructorSelectProps {
  options: InstructorOption[]
  value: string | null
  onChange: (id: string) => void
  error?: string
}

export function InstructorSelect({
  options,
  value,
  onChange,
  error,
}: InstructorSelectProps) {
  const selected = options.find((opt) => opt.id === value) ?? null

  if (options.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <UserCircle2 className="h-4 w-4 shrink-0" />
          <span>Nenhum instrutor cadastrado.</span>
        </div>
        <Link
          href="/admin/instructors"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Criar instrutor
          <ExternalLink className="h-3 w-3" />
        </Link>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger
          aria-invalid={error ? 'true' : 'false'}
          className={cn(error && 'border-destructive ring-destructive')}
        >
          <SelectValue placeholder="Selecione o instrutor">
            {selected && <OptionLabel option={selected} />}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <OptionLabel option={option} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function OptionLabel({ option }: { option: InstructorOption }) {
  return (
    <span className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={option.avatar_url}
        alt=""
        className="h-6 w-6 shrink-0 rounded-full object-cover"
      />
      <span className="truncate">{option.name}</span>
    </span>
  )
}
