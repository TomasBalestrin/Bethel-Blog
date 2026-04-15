import Link from 'next/link'

import { CategoryChip } from '@/components/shared/CategoryChip'
import { cn } from '@/lib/utils/cn'

export interface CategoryFiltersItem {
  id: string
  name: string
  slug: string
  color: string
}

interface CategoryFiltersProps {
  categories: CategoryFiltersItem[]
  activeSlug?: string | null
}

export function CategoryFilters({ categories, activeSlug }: CategoryFiltersProps) {
  if (categories.length === 0) return null

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1"
      aria-label="Filtrar por categoria"
    >
      <Link
        href="/"
        className={cn(
          'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
          !activeSlug
            ? 'bg-foreground text-background'
            : 'bg-muted text-muted-foreground hover:bg-accent'
        )}
      >
        Todas
      </Link>
      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          name={category.name}
          slug={category.slug}
          color={category.color}
          size="md"
          active={category.slug === activeSlug}
        />
      ))}
    </div>
  )
}
