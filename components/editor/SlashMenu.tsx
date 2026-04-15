'use client'

import { FloatingMenu, type Editor } from '@tiptap/react'
import {
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Quote,
  Text,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils/cn'

interface SlashMenuProps {
  editor: Editor
}

interface SlashItem {
  label: string
  icon: LucideIcon
  action: (editor: Editor) => void
}

const ITEMS: SlashItem[] = [
  {
    label: 'Parágrafo',
    icon: Text,
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    label: 'Título H2',
    icon: Heading2,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'Título H3',
    icon: Heading3,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'Lista',
    icon: List,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Lista numerada',
    icon: ListOrdered,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'Citação',
    icon: Quote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: 'Separador',
    icon: Minus,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]

export function SlashMenu({ editor }: SlashMenuProps) {
  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{ duration: 120, placement: 'left-start' }}
      shouldShow={({ state }) => {
        const { $from } = state.selection
        const currentText = $from.parent.textContent
        return state.selection.empty && currentText.startsWith('/')
      }}
      className="max-h-80 w-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
    >
      <ul className="flex flex-col">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => {
                  // remove o "/" digitado antes de aplicar
                  editor.chain().focus().deleteRange({
                    from: editor.state.selection.$from.start(),
                    to: editor.state.selection.$from.pos,
                  }).run()
                  item.action(editor)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-accent'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </FloatingMenu>
  )
}
