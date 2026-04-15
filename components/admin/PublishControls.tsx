'use client'

import { useState } from 'react'
import { CalendarClock, ExternalLink, Loader2, Save, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface PublishControlsProps {
  slug: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  saveLabel: string
  saving: boolean
  publishing: boolean
  scheduling: boolean
  onSave: () => void
  onPublish: () => void
  onSchedule: (scheduledAt: string) => void
}

function nowLocalIso(): string {
  // input type=datetime-local usa formato sem timezone
  const d = new Date(Date.now() + 60 * 60 * 1000) // +1h default
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function PublishControls({
  slug,
  status,
  saveLabel,
  saving,
  publishing,
  scheduling,
  onSave,
  onPublish,
  onSchedule,
}: PublishControlsProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduledAt, setScheduledAt] = useState(nowLocalIso)

  const anyPending = saving || publishing || scheduling
  const previewUrl = `/p/${slug}?preview=1`

  function handleSchedule() {
    const iso = new Date(scheduledAt).toISOString()
    onSchedule(iso)
    setScheduleOpen(false)
  }

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {saveLabel}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          asChild
          disabled={anyPending}
        >
          <a href={previewUrl} target="_blank" rel="noopener">
            <ExternalLink className="h-4 w-4" />
            Visualizar
          </a>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={anyPending}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar rascunho
        </Button>

        <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={anyPending || status === 'archived'}
            >
              <CalendarClock className="h-4 w-4" />
              Agendar
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-3">
            <div>
              <label htmlFor="scheduled-at" className="mb-1 block text-sm font-medium">
                Publicar em
              </label>
              <input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                min={nowLocalIso()}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={handleSchedule}
              disabled={scheduling}
            >
              {scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar agendamento
            </Button>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          size="sm"
          onClick={onPublish}
          disabled={anyPending || status === 'archived'}
        >
          {publishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {status === 'published' ? 'Republicar' : 'Publicar agora'}
        </Button>
      </div>
    </div>
  )
}
