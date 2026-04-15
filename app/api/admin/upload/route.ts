import { NextResponse, type NextRequest } from 'next/server'
import { fileTypeFromBuffer } from 'file-type'
import { nanoid } from 'nanoid'
import slugify from 'slugify'

import { optimizeImage } from '@/lib/image/optimize'
import {
  ALLOWED_MIME_TYPES,
  IMAGE_VARIANTS,
  MAX_UPLOAD_BYTES,
} from '@/lib/image/variants'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'blog-images'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse multipart
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Campo "file" ausente ou inválido' },
        { status: 400 }
      )
    }

    // 3. Tamanho
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Arquivo excede o limite de ${MAX_UPLOAD_BYTES / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // 4. MIME via magic bytes (não confiar em extensão)
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)
    const detected = await fileTypeFromBuffer(inputBuffer)
    if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime as typeof ALLOWED_MIME_TYPES[number])) {
      return NextResponse.json(
        { error: 'Formato não suportado. Use jpg, png, webp, heic ou avif.' },
        { status: 400 }
      )
    }

    // 5. Otimização via Sharp (3 variantes WebP q85)
    const variants = await optimizeImage(inputBuffer)

    // 6. Naming: {year}/{month}/{uuid}-{slug}
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const uuid = nanoid(12)
    const baseName = slugify(file.name.replace(/\.[^.]+$/, ''), {
      lower: true,
      strict: true,
      locale: 'pt',
    })
    const safeName = baseName || 'image'
    const folder = `${year}/${month}`

    // 7. Upload de cada variante + original
    const uploads = await Promise.all(
      variants.map(async (variant) => {
        const path = `${folder}/${uuid}-${safeName}-${variant.name}.webp`
        const { error } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(path, variant.buffer, {
            contentType: variant.contentType,
            cacheControl: '31536000, immutable',
            upsert: false,
          })
        if (error) throw error
        const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
        return { name: variant.name, width: variant.width, url: data.publicUrl }
      })
    )

    // Upload do original (fallback)
    const originalExt = detected.ext
    const originalPath = `${folder}/${uuid}-${safeName}-original.${originalExt}`
    const { error: originalError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(originalPath, inputBuffer, {
        contentType: detected.mime,
        cacheControl: '31536000, immutable',
        upsert: false,
      })
    if (originalError) throw originalError
    const { data: originalPublic } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(originalPath)

    // 8. Response: map por variant name + original
    const urlsByVariant = uploads.reduce(
      (acc, u) => {
        acc[u.name] = u.url
        return acc
      },
      {} as Record<string, string>
    )

    const result = {
      thumb: urlsByVariant.thumb,
      medium: urlsByVariant.medium,
      large: urlsByVariant.large,
      original: originalPublic.publicUrl,
      variants: IMAGE_VARIANTS.map((v) => ({ name: v.name, width: v.width })),
    }

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
