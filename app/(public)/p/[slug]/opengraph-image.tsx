import { ImageResponse } from 'next/og'

import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const alt = 'Bethel Blog'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params

  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('title, cover_url, excerpt')
    .eq('status', 'published')
    .is('deleted_at', null)
    .eq('slug', slug)
    .maybeSingle()

  const title = data?.title ?? 'Bethel Blog'
  const excerpt = data?.excerpt ?? ''
  const cover = data?.cover_url

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#1a1815',
          color: '#f4f3ee',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            padding: '64px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#b1ada1',
            }}
          >
            Bethel Blog
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 960,
            }}
          >
            {title}
          </div>
          {excerpt && (
            <div
              style={{
                fontSize: 28,
                color: '#d1ccc4',
                maxWidth: 960,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {excerpt}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
