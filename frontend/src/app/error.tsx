"use client";

import { PageError } from "@/components/feedback/page-error";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="conteudo-principal" className="mx-auto max-w-3xl p-6">
      <PageError
        message={error.message || "A página encontrou um erro inesperado."}
        traceId={error.digest}
        onRetry={reset}
      />
    </main>
  );
}
