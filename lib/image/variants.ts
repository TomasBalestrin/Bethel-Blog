export interface ImageVariant {
  name: 'thumb' | 'medium' | 'large'
  width: number
}

export const IMAGE_VARIANTS: readonly ImageVariant[] = [
  { name: 'thumb', width: 480 },
  { name: 'medium', width: 1024 },
  { name: 'large', width: 1920 },
] as const

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/avif',
] as const

export const WEBP_QUALITY = 85
