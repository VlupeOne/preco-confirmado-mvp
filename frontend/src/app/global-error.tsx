"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <h1 className="text-2xl font-bold">
              Não foi possível abrir a aplicação
            </h1>
            <p className="mt-2 text-sm">
              Recarregue a interface. Seus dados continuam preservados no
              backend.
            </p>
            <button
              className="mt-5 rounded-lg border px-4 py-2"
              onClick={reset}
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
