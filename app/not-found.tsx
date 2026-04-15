import Link from 'next/link'
import { SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="h-7 w-7" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        Página não encontrada
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button asChild>
          <Link href="/">Voltar para a home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Buscar posts</Link>
        </Button>
      </div>
    </div>
  )
}
