'use client'

import { useCallback } from 'react'
import { BubbleMenu, type Editor } from '@tiptap/react'
import { Bold, Italic, Link2, Link2Off } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previousUrl ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    try {
      // valida URL
      new URL(url)
    } catch {
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 120 }}
      className="flex items-center gap-1 rounded-md border border-border bg-popover p-1 shadow-md"
    >
      <ToolbarButton
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Negrito (Cmd+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Itálico (Cmd+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('link')}
        onClick={setLink}
        label="Link (Cmd+K)"
      >
        {editor.isActive('link') ? (
          <Link2Off className="h-4 w-4" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </ToolbarButton>
    </BubbleMenu>
  )
}

interface ToolbarButtonProps {
  active?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}

function ToolbarButton({ active, onClick, label, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', active && 'bg-accent text-accent-foreground')}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
