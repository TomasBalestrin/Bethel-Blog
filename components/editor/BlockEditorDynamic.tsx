'use client'

import dynamic from 'next/dynamic'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Wrapper dinâmico do BlockEditor com ssr:false. Tiptap usa APIs
 * de DOM (ProseMirror) que não rodam no servidor — render só no
 * client. Use este wrapper em páginas admin:
 *   import { BlockEditorDynamic } from '@/components/editor/BlockEditorDynamic'
 */
export const BlockEditorDynamic = dynamic(
  () => import('./BlockEditor').then((mod) => mod.BlockEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  }
)
