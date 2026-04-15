import 'server-only'

import sharp from 'sharp'

import { IMAGE_VARIANTS, WEBP_QUALITY, type ImageVariant } from './variants'

export interface OptimizedVariant {
  name: ImageVariant['name']
  width: number
  buffer: Buffer
  contentType: 'image/webp'
}

/**
 * Recebe buffer original, gera 3 variantes WebP (thumb/medium/large)
 * com qualidade 85 e redimensionadas pela largura. Mantém aspect
 * ratio (altura calculada automaticamente). Só redimensiona pra
 * BAIXO — se a imagem for menor que a variant, mantém tamanho.
 */
export async function optimizeImage(input: Buffer): Promise<OptimizedVariant[]> {
  const variants = await Promise.all(
    IMAGE_VARIANTS.map(async (variant) => {
      const buffer = await sharp(input, { failOn: 'error' })
        .rotate() // corrige orientação EXIF
        .resize({
          width: variant.width,
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()

      return {
        name: variant.name,
        width: variant.width,
        buffer,
        contentType: 'image/webp' as const,
      }
    })
  )

  return variants
}
