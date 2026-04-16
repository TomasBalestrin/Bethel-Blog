'use client'

import { useCallback } from 'react'
import { nanoid } from 'nanoid'

import { AddBlockButton } from './blocks/AddBlockButton'
import { BlockActions } from './blocks/BlockActions'
import { HeadingBlock } from './blocks/HeadingBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { ParagraphBlock } from './blocks/ParagraphBlock'
import { VideoBlock } from './blocks/VideoBlock'
import type {
  Block,
  BlockType,
  PostContent,
} from '@/types/post-blocks'

interface BlockBuilderProps {
  value: PostContent
  onChange: (value: PostContent) => void
}

function createBlock(type: BlockType): Block {
  const id = nanoid(10)
  switch (type) {
    case 'heading':
      return { id, type, text: '' }
    case 'paragraph':
      return { id, type, text: '' }
    case 'image':
      return { id, type, url: null, alt: '' }
    case 'video':
      return { id, type, provider: 'youtube', videoId: null }
  }
}

export function BlockBuilder({ value, onChange }: BlockBuilderProps) {
  const emit = useCallback(
    (blocks: Block[]) => onChange({ version: 1, blocks }),
    [onChange]
  )

  const addBlock = useCallback(
    (type: BlockType, atIndex?: number) => {
      const block = createBlock(type)
      const next = [...value.blocks]
      const idx = atIndex ?? next.length
      next.splice(idx, 0, block)
      emit(next)
    },
    [value.blocks, emit]
  )

  const updateBlock = useCallback(
    (id: string, patch: Partial<Block>) => {
      emit(
        value.blocks.map((block) =>
          block.id === id ? ({ ...block, ...patch } as Block) : block
        )
      )
    },
    [value.blocks, emit]
  )

  const deleteBlock = useCallback(
    (id: string) => emit(value.blocks.filter((block) => block.id !== id)),
    [value.blocks, emit]
  )

  const moveBlock = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const index = value.blocks.findIndex((block) => block.id === id)
      if (index === -1) return
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= value.blocks.length) return
      const next = [...value.blocks]
      const current = next[index]
      const neighbor = next[target]
      if (!current || !neighbor) return
      next[index] = neighbor
      next[target] = current
      emit(next)
    },
    [value.blocks, emit]
  )

  if (value.blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum bloco ainda. Adicione o primeiro:
        </p>
        <AddBlockButton onSelect={(type) => addBlock(type)} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {value.blocks.map((block, index) => {
        const actions = (
          <BlockActions
            onMoveUp={() => moveBlock(block.id, 'up')}
            onMoveDown={() => moveBlock(block.id, 'down')}
            onDelete={() => deleteBlock(block.id)}
            canMoveUp={index > 0}
            canMoveDown={index < value.blocks.length - 1}
          />
        )

        return (
          <div key={block.id}>
            <div className="group relative rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-muted/30 focus-within:border-border">
              {block.type === 'heading' && (
                <HeadingBlock
                  block={block}
                  onChange={(patch) => updateBlock(block.id, patch)}
                  actions={actions}
                />
              )}
              {block.type === 'paragraph' && (
                <ParagraphBlock
                  block={block}
                  onChange={(patch) => updateBlock(block.id, patch)}
                  actions={actions}
                />
              )}
              {block.type === 'image' && (
                <ImageBlock
                  block={block}
                  onChange={(patch) => updateBlock(block.id, patch)}
                  actions={actions}
                />
              )}
              {block.type === 'video' && (
                <VideoBlock
                  block={block}
                  onChange={(patch) => updateBlock(block.id, patch)}
                  actions={actions}
                />
              )}
            </div>

            <div className="py-1">
              <AddBlockButton
                compact
                onSelect={(type) => addBlock(type, index + 1)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
