import { Fragment, type ReactNode } from 'react'

import type { ParagraphBlock } from '@/types/post-blocks'

interface ParagraphRenderProps {
  block: ParagraphBlock
}

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string }
  | { kind: 'link'; label: string; href: string }

const INLINE_REGEX =
  /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g

const ALLOWED_PROTOCOLS = /^(https?:|mailto:)/i

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let last = 0
  let match: RegExpExecArray | null
  INLINE_REGEX.lastIndex = 0

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ kind: 'text', value: text.slice(last, match.index) })
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      tokens.push({ kind: 'link', label: match[1], href: match[2] })
    } else if (match[3] !== undefined) {
      tokens.push({ kind: 'bold', value: match[3] })
    } else if (match[4] !== undefined) {
      tokens.push({ kind: 'italic', value: match[4] })
    }
    last = INLINE_REGEX.lastIndex
  }
  if (last < text.length) {
    tokens.push({ kind: 'text', value: text.slice(last) })
  }
  return tokens
}

function renderTokens(tokens: Token[]): ReactNode[] {
  return tokens.map((token, index) => {
    switch (token.kind) {
      case 'text':
        return token.value
      case 'bold':
        return <strong key={index}>{token.value}</strong>
      case 'italic':
        return <em key={index}>{token.value}</em>
      case 'link':
        if (!ALLOWED_PROTOCOLS.test(token.href)) return token.label
        return (
          <a
            key={index}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {token.label}
          </a>
        )
    }
  })
}

function renderLine(line: string): ReactNode[] {
  return renderTokens(tokenize(line))
}

export function ParagraphRender({ block }: ParagraphRenderProps) {
  const text = block.text.trim()
  if (!text) return null

  // \n\n+ = novo <p> (parágrafo); \n simples = <br /> dentro do <p>
  const paragraphs = text.split(/\n\n+/)

  return (
    <div className="my-5 space-y-4">
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n')
        return (
          <p
            key={pi}
            className="font-sans text-base leading-relaxed text-foreground md:text-lg"
          >
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderLine(line)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
