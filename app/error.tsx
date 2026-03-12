"use client"

import { ErrorState } from "@/components/states/error_state"
import { Button } from "@/components/ui/button"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ErrorState
          title="Algo deu errado"
          description={
            error.message ||
            "Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir."
          }
          code={error.digest}
          action={
            <Button
              onClick={reset}
              className="h-10 rounded-xl px-6 text-sm font-semibold"
            >
              Tentar novamente
            </Button>
          }
        />
      </div>
    </div>
  )
}
