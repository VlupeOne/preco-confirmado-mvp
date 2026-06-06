import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  CircleDollarSign,
  Clock3,
  Eye,
  SearchCheck,
  ShieldCheck,
  Store,
  Tags,
} from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/shared/brand";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const validations = [
  "Mesmo produto e variante",
  "Preço repetido na segunda consulta",
  "Estoque disponível",
  "Vendedor consistente",
  "Pagamento identificado",
  "Cupom e validade conferidos",
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Brand />
          <nav className="text-muted-foreground ml-auto hidden items-center gap-6 text-sm md:flex">
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
            </a>
            <a href="#confianca" className="hover:text-foreground">
              Confiança
            </a>
            <a href="#limites" className="hover:text-foreground">
              Transparência
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-6">
            <ThemeToggle />
            <Link
              href="/login"
              className={buttonVariants({
                variant: "ghost",
                className: "hidden sm:inline-flex",
              })}
            >
              Entrar
            </Link>
            <Link href="/register" className={buttonVariants()}>
              Começar
            </Link>
          </div>
        </div>
      </header>

      <main id="conteudo-principal">
        <section className="surface-grid overflow-hidden border-b">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
            <div>
              <div className="border-success/25 bg-success/10 text-success inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
                <ShieldCheck className="size-4" />
                Menos impulso, mais confirmação
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Preço encontrado é bom.{" "}
                <span className="text-success">Preço confirmado é melhor.</span>
              </h1>
              <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
                Monitore sua meta e receba alertas somente quando uma segunda
                consulta confirmar preço, estoque, vendedor, variante e
                pagamento.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: "lg",
                    className: "h-12 px-5",
                  })}
                >
                  Monitorar meu primeiro produto
                  <ArrowRight />
                </Link>
                <a
                  href="#como-funciona"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "h-12 px-5",
                  })}
                >
                  Entender a verificação
                </a>
              </div>
              <div className="text-muted-foreground mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <Check className="text-success size-4" /> Sem alerta
                  instantâneo
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="text-success size-4" /> Score transparente
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="text-success size-4" /> Histórico real
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="bg-success/15 absolute -inset-8 -z-10 rounded-full blur-3xl" />
              <Card className="overflow-hidden shadow-2xl shadow-slate-900/10">
                <div className="bg-primary text-primary-foreground flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs text-slate-300">Alerta confirmado</p>
                    <p className="mt-1 font-semibold">Notebook Modelo X</p>
                  </div>
                  <BadgeCheck className="size-8 text-emerald-300" />
                </div>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-4 border-b pb-5">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Preço confirmado
                      </p>
                      <p className="mt-1 text-3xl font-bold">R$ 3.499,00</p>
                    </div>
                    <p className="text-success text-sm font-semibold">
                      R$ 501 abaixo da meta
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Primeira consulta
                      </p>
                      <p className="mt-1 font-medium">14:32 · R$ 3.499</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Segunda consulta
                      </p>
                      <p className="mt-1 font-medium">14:34 · R$ 3.499</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Vendedor</p>
                      <p className="mt-1 font-medium">Loja Exemplo</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Pagamento</p>
                      <p className="mt-1 font-medium">Pix</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <ConfidenceBadge confidence="HIGH" score={95} />
                    <StatusBadge status="APPROVED" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6"
        >
          <div className="max-w-2xl">
            <p className="text-success text-xs font-semibold tracking-[0.18em] uppercase">
              O problema
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Uma promoção pode desaparecer entre o clique e o checkout.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Preço antigo, estoque encerrado, vendedor trocado ou condição de
              pagamento diferente transformam um bom alerta em frustração.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: SearchCheck,
                title: "1. Encontrar",
                text: "O backend consulta o provedor e registra o primeiro snapshot real.",
              },
              {
                icon: Clock3,
                title: "2. Reconsultar",
                text: "Quando a meta é atingida, uma nova consulta é agendada e persistida.",
              },
              {
                icon: BellRing,
                title: "3. Confirmar",
                text: "Somente score alto e critérios obrigatórios aprovados geram alerta.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <span className="bg-accent text-accent-foreground grid size-11 place-items-center rounded-xl">
                    <Icon />
                  </span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="confianca" className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300 uppercase">
                Score de confiança
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                O alerta explica por que a oferta foi aprovada.
              </h2>
              <p className="mt-4 text-slate-300">
                A pontuação é calculada exclusivamente pelo backend. A interface
                apresenta o resultado, os horários e os motivos de rejeição sem
                recalcular nenhuma regra.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {validations.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  {[Tags, CircleDollarSign, Store, Eye, BadgeCheck, Clock3][
                    index
                  ] &&
                    (() => {
                      const Icon = [
                        Tags,
                        CircleDollarSign,
                        Store,
                        Eye,
                        BadgeCheck,
                        Clock3,
                      ][index];
                      return <Icon className="size-5 text-emerald-300" />;
                    })()}
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="limites" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="bg-card grid gap-8 rounded-3xl border p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-warning text-xs font-semibold tracking-[0.18em] uppercase">
                Transparência primeiro
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                Confirmação não é garantia eterna.
              </h2>
              <p className="text-muted-foreground mt-3 max-w-3xl">
                O preço é confirmado no horário indicado, mas a loja pode
                alterá-lo depois. O projeto não calcula frete e depende das
                informações fornecidas pelo provedor.
              </p>
            </div>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "h-12")}
            >
              Criar conta gratuita
              <ArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Brand />
          <p>Monitoramento transparente com dupla verificação.</p>
        </div>
      </footer>
    </div>
  );
}
