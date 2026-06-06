import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="conteudo-principal"
      className="surface-grid grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]"
    >
      <section className="bg-primary text-primary-foreground hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <Brand className="text-white [&_.text-success]:text-emerald-300" />
        <div className="max-w-xl">
          <ShieldCheck className="mb-6 size-12 text-emerald-300" />
          <h1 className="text-4xl font-bold tracking-tight">
            Preço encontrado é bom. Preço confirmado é melhor.
          </h1>
          <p className="mt-5 text-lg text-slate-300">
            A oferta só vira alerta depois de uma segunda consulta e da
            validação de preço, estoque, vendedor, variante e pagamento.
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Transparência para decidir com menos pressa e mais confiança.
        </p>
      </section>
      <section className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between p-5 sm:p-8">
          <Brand className="lg:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <Link
              className="text-muted-foreground text-sm hover:underline"
              href="/"
            >
              Voltar ao início
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 pb-12">
          {children}
        </div>
      </section>
    </main>
  );
}
