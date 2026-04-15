import Image, { type ImageProps } from 'next/image'

import { cn } from '@/lib/utils/cn'

type BlogImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string
  alt: string
  className?: string
}

/**
 * Wrapper fino do next/image. `sizes` default pro layout de post
 * (container max-w-720 + cover full-width). Override passando `sizes`.
 */
export function BlogImage({
  src,
  alt,
  className,
  sizes = '(min-width: 1024px) 720px, 100vw',
  ...rest
}: BlogImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      className={cn('h-auto w-full', className)}
      {...rest}
    />
  )
}
