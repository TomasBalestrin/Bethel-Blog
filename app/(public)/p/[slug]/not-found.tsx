import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function PostNotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Post não encontrado</h1>
      <p className="max-w-md text-muted-foreground">
        O post que você procura foi removido ou nunca existiu.
      </p>
      <Button asChild>
        <Link href="/">Voltar para a home</Link>
      </Button>
    </div>
  )
}
