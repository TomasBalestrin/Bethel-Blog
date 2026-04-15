import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import type { Extensions } from '@tiptap/react'

interface BuildExtensionsOptions {
  placeholder?: string
}

/**
 * Conjunto único de extensões compartilhado entre o editor client
 * (BlockEditor) e o render server-side (tiptap-renderer). Manter
 * paridade é crítico: se divergir, conteúdo salvo pode quebrar no
 * render público.
 */
export function buildExtensions({
  placeholder = 'Comece a escrever... ou digite "/" para abrir o menu de blocos',
}: BuildExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      bulletList: { keepMarks: true, keepAttributes: true },
      orderedList: { keepMarks: true, keepAttributes: true },
      blockquote: {},
      horizontalRule: {},
      code: {},
      codeBlock: false,
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'rounded-lg',
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      protocols: ['http', 'https', 'mailto'],
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        class: 'text-primary underline underline-offset-2',
      },
    }),
    Placeholder.configure({
      placeholder,
      includeChildren: true,
    }),
  ]
}

// Lista útil para quem precisa apenas das extensões padrão.
export const sharedExtensions = buildExtensions()
