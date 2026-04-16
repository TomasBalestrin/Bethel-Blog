'use client'

import {
  AlignLeft,
  Heading2,
  Image as ImageIcon,
  Plus,
  Video,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'
import type { BlockType } from '@/types/post-blocks'

interface AddBlockButtonProps {
  onSelect: (type: BlockType) => void
  /** Compact: sem label, usado entre blocos. Default: com label. */
  compact?: boolean
  className?: string
}

interface MenuItem {
  type: BlockType
  label: string
  icon: LucideIcon
}

const MENU_ITEMS: MenuItem[] = [
  { type: 'heading', label: 'Título', icon: Heading2 },
  { type: 'paragraph', label: 'Conteúdo', icon: AlignLeft },
  { type: 'image', label: 'Foto', icon: ImageIcon },
  { type: 'video', label: 'Vídeo', icon: Video },
]

export function AddBlockButton({
  onSelect,
  compact = false,
  className,
}: AddBlockButtonProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={compact ? 'icon' : 'sm'}
            aria-label="Adicionar bloco"
            className={cn(
              compact
                ? 'h-8 w-8 rounded-full border-dashed'
                : 'gap-2 rounded-full border-dashed'
            )}
          >
            <Plus className="h-4 w-4" />
            {!compact && <span>Adicionar bloco</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.type}
                onSelect={() => onSelect(item.type)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
