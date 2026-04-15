import Link from 'next/link'

import { cn } from '@/lib/utils/cn'

export interface CategoryChipProps {
  name: string
  slug: string
  color: string
  active?: boolean
  size?: 'sm' | 'md'
  asLink?: boolean
  className?: string
}

export function CategoryChip({
  name,
  slug,
  color,
  active,
  size = 'sm',
  asLink = true,
  className,
}: CategoryChipProps) {
  const classes = cn(
    'inline-flex items-center whitespace-nowrap rounded-full font-medium transition-colors',
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    active && 'ring-2 ring-offset-1 ring-offset-background',
    className
  )
  const style = active
    ? { backgroundColor: color, color: '#fff' }
    : { backgroundColor: `${color}22`, color }

  if (!asLink) {
    return (
      <span className={classes} style={style}>
        {name}
      </span>
    )
  }

  return (
    <Link href={`/category/${slug}`} className={classes} style={style}>
      {name}
    </Link>
  )
}
