'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils/cn'

export interface CategoryOption {
  id: string
  name: string
  color: string
}

interface CategorySelectorProps {
  options: CategoryOption[]
  value: string[]
  onChange: (ids: string[]) => void
  max?: number
}

export function CategorySelector({
  options,
  value,
  onChange,
  max = 5,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(
    () => options.filter((c) => value.includes(c.id)),
    [options, value]
  )

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
      return
    }
    if (value.length >= max) return
    onChange([...value, id])
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {selected.length === 0
                ? 'Selecionar categorias'
                : `${selected.length} selecionada${selected.length > 1 ? 's' : ''}`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-1">
          {options.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhuma categoria cadastrada.
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {options.map((option) => {
                const isSelected = value.includes(option.id)
                const isDisabled = !isSelected && value.length >= max
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => toggle(option.id)}
                      disabled={isDisabled}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
                        'hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-sm border border-border"
                        style={{
                          backgroundColor: isSelected ? option.color : 'transparent',
                        }}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                      {option.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            {value.length}/{max} selecionadas
          </p>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${c.color}22`,
                color: c.color,
              }}
            >
              {c.name}
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-label={`Remover ${c.name}`}
                className="transition-opacity hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
