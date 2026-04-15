'use client'

import { useCallback, useEffect } from 'react'
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'

import { cn } from '@/lib/utils/cn'

import { EditorToolbar } from './EditorToolbar'
import { SlashMenu } from './SlashMenu'
import { buildExtensions } from './extensions'

interface BlockEditorProps {
  initialContent?: JSONContent
  onChange?: (json: JSONContent) => void
  onImageUploadRequest?: () => void
  placeholder?: string
  className?: string
}

const EDITOR_CLASS =
  'prose prose-neutral dark:prose-invert max-w-none min-h-[400px] rounded-md border border-border bg-background px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function BlockEditor({
  initialContent,
  onChange,
  onImageUploadRequest,
  placeholder,
  className,
}: BlockEditorProps) {
  const editor = useEditor({
    extensions: buildExtensions({ placeholder }),
    content: initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(EDITOR_CLASS, className),
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false
        const image = Array.from(files).find((f) => f.type.startsWith('image/'))
        if (!image) return false
        event.preventDefault()
        onImageUploadRequest?.()
        return true
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
  })

  // Atualiza conteúdo inicial se prop mudar (ex: carregou post existente).
  useEffect(() => {
    if (!editor || !initialContent) return
    const current = editor.getJSON()
    if (JSON.stringify(current) === JSON.stringify(initialContent)) return
    editor.commands.setContent(initialContent, false)
  }, [editor, initialContent])

  const handleInsertImage = useCallback(
    (url: string, alt?: string) => {
      editor?.chain().focus().setImage({ src: url, alt }).run()
    },
    [editor]
  )

  // Expõe o método via ref indireta (uploader externo chama via evento).
  useEffect(() => {
    if (!editor) return
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ url: string; alt?: string }>).detail
      if (!detail?.url) return
      handleInsertImage(detail.url, detail.alt)
    }
    window.addEventListener('bethel:insert-image', handler)
    return () => window.removeEventListener('bethel:insert-image', handler)
  }, [editor, handleInsertImage])

  if (!editor) return null

  return (
    <div className="relative">
      <EditorToolbar editor={editor} />
      <SlashMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
