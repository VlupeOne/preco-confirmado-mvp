"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BellRing,
  CirclePlay,
  FlaskConical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageError } from "@/components/feedback/page-error";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { PermissionDenied } from "@/components/feedback/permission-denied";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateTimeValue, MoneyValue } from "@/components/shared/values";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createMockOffer,
  dispatchNotifications,
  listMockOffers,
  listOutbox,
  removeMockOffer,
  runMonitoring,
  runRechecks,
  updateMockOffer,
} from "@/features/admin-demo/api";
import { MockOfferForm } from "@/features/admin-demo/mock-offer-form";
import { useSession } from "@/features/auth/use-session";
import { listProducts } from "@/features/products/api";
import { ApiError } from "@/lib/api/problem-details";
import { queryKeys } from "@/lib/api/query-keys";
import type { MockOffer, MockOfferInput } from "@/lib/api/types";

function offerPayload(
  offer: MockOffer,
  changes: Partial<MockOfferInput> = {},
): MockOfferInput {
  return {
    externalId: offer.externalId ?? "",
    title: offer.title ?? "",
    price: offer.price ?? 0.01,
    regularPrice: offer.regularPrice,
    currency: offer.currency ?? "BRL",
    paymentType: offer.paymentType ?? "UNKNOWN",
    sellerId: offer.sellerId,
    sellerName: offer.sellerName,
    condition: offer.condition ?? "NEW",
    color: offer.color,
    storage: offer.storage,
    inStock: offer.inStock ?? false,
    availableQuantity: offer.availableQuantity,
    couponRequired: offer.couponRequired ?? false,
    couponCode: offer.couponCode,
    sourceUrl: offer.sourceUrl ?? "",
    ...changes,
  };
}

function maskRecipient(value?: string) {
  if (!value) return "—";
  const [local, domain] = value.split("@");
  if (!domain) return `${value.slice(0, 2)}***`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function AdminDemoPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MockOffer>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const offers = useQuery({
    queryKey: queryKeys.mockOffers,
    queryFn: listMockOffers,
  });
  const outbox = useQuery({
    queryKey: queryKeys.outbox(),
    queryFn: () => listOutbox(),
  });
  const mockProducts = useQuery({
    queryKey: queryKeys.products({ admin: "mock" }),
    queryFn: () => listProducts({ page: 0, size: 100, provider: "MOCK" }),
  });
  const save = useMutation({
    mutationFn: (payload: MockOfferInput) =>
      editing?.externalId
        ? updateMockOffer({ externalId: editing.externalId, payload })
        : createMockOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mockOffers });
      setDialogOpen(false);
      setEditing(undefined);
      toast.success("Oferta MOCK salva no backend.");
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.problem.message : "Oferta não salva.",
      ),
  });
  const update = useMutation({
    mutationFn: ({
      offer,
      changes,
    }: {
      offer: MockOffer;
      changes: Partial<MockOfferInput>;
    }) =>
      updateMockOffer({
        externalId: offer.externalId ?? "",
        payload: offerPayload(offer, changes),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mockOffers });
      toast.success("Cenário atualizado no backend.");
    },
  });
  const remove = useMutation({
    mutationFn: removeMockOffer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.mockOffers }),
  });
  const action = useMutation({
    mutationFn: async (kind: "monitor" | "recheck" | "dispatch") => {
      if (kind === "monitor") return runMonitoring();
      if (kind === "recheck") return runRechecks();
      return dispatchNotifications();
    },
    onSuccess: (result, kind) => {
      const processed = result.processed ?? 0;
      toast.success(`${processed} registro(s) processado(s).`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      if (kind === "dispatch") {
        queryClient.invalidateQueries({ queryKey: ["outbox"] });
      }
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.problem.message
          : "Ação não concluída.",
      ),
  });

  if (session.isLoading) return <PageSkeleton />;
  if (session.data?.role !== "ADMIN") return <PermissionDenied />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administração"
        title="Demonstração técnica"
        description="Controle ofertas simuladas e execute manualmente cada etapa persistida do fluxo."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={<Button onClick={() => setEditing(undefined)} />}
            >
              <Plus /> Criar oferta MOCK
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar oferta MOCK" : "Nova oferta MOCK"}
                </DialogTitle>
              </DialogHeader>
              <MockOfferForm
                offer={editing}
                pending={save.isPending}
                onSubmit={(payload) => save.mutate(payload)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Alert>
        <FlaskConical />
        <AlertTitle>Recurso disponível apenas no profile dev</AlertTitle>
        <AlertDescription>
          Se o backend não estiver usando o profile <code>dev</code>, os
          endpoints MOCK retornarão 404. A autorização definitiva continua no
          backend.
        </AlertDescription>
      </Alert>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Ofertas MOCK</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            As ações rápidas abaixo alteram o registro real, não apenas a
            interface.
          </p>
        </div>
        {offers.isLoading && <PageSkeleton cards={2} />}
        {offers.isError && (
          <PageError
            message="Não foi possível acessar ofertas MOCK. Confirme o profile dev."
            onRetry={() => offers.refetch()}
          />
        )}
        {offers.data?.length === 0 && (
          <EmptyState
            title="Nenhuma oferta MOCK"
            description="Crie uma oferta para iniciar o roteiro de demonstração."
          />
        )}
        <div className="grid gap-4 xl:grid-cols-2">
          {offers.data?.map((offer) => {
            const product = mockProducts.data?.content?.find(
              (item) => item.externalId === offer.externalId,
            );
            return (
              <Card key={offer.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {offer.externalId}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar oferta"
                      onClick={() => {
                        setEditing(offer);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remover oferta"
                        >
                          <Trash2 />
                        </Button>
                      }
                      title="Remover oferta MOCK?"
                      description="O registro será removido do backend de desenvolvimento."
                      destructive
                      confirmLabel="Remover"
                      pending={remove.isPending}
                      onConfirm={() => remove.mutate(offer.externalId ?? "")}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Preço</p>
                      <MoneyValue
                        value={offer.price}
                        currency={offer.currency}
                        className="font-semibold"
                      />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Estoque</p>
                      <p>
                        {offer.inStock
                          ? `${offer.availableQuantity ?? "?"} unidade(s)`
                          : "Indisponível"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Vendedor</p>
                      <p>{offer.sellerName ?? offer.sellerId ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Variante</p>
                      <p>
                        {[offer.color, offer.storage]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!product?.targetPrice || update.isPending}
                      title={
                        product
                          ? "Define o preço um real abaixo da meta"
                          : "Cadastre um produto MOCK com o mesmo externalId"
                      }
                      onClick={() =>
                        product?.targetPrice &&
                        update.mutate({
                          offer,
                          changes: {
                            price: Math.max(0.01, product.targetPrice - 1),
                          },
                        })
                      }
                    >
                      Abaixo da meta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update.mutate({
                          offer,
                          changes: { inStock: false, availableQuantity: 0 },
                        })
                      }
                    >
                      Retirar estoque
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update.mutate({
                          offer,
                          changes: {
                            sellerId: `${offer.sellerId ?? "SELLER"}-ALT`,
                            sellerName: "Outro vendedor",
                          },
                        })
                      }
                    >
                      Trocar vendedor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update.mutate({
                          offer,
                          changes: {
                            color: offer.color === "Preto" ? "Azul" : "Preto",
                          },
                        })
                      }
                    >
                      Trocar cor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update.mutate({
                          offer,
                          changes: {
                            storage:
                              offer.storage === "512GB" ? "1TB" : "512GB",
                          },
                        })
                      }
                    >
                      Trocar armazenamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Ações administrativas</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Cada ação bloqueia cliques duplicados e invalida apenas os dados
            relacionados.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              kind: "monitor" as const,
              title: "Executar monitoramento",
              text: "Consulta produtos vencidos e salva novos snapshots.",
              icon: CirclePlay,
            },
            {
              kind: "recheck" as const,
              title: "Processar rechecagens",
              text: "Conclui verificações pendentes cujo horário chegou.",
              icon: RefreshCw,
            },
            {
              kind: "dispatch" as const,
              title: "Processar notificações",
              text: "Envia itens pendentes da outbox e registra o resultado.",
              icon: BellRing,
            },
          ].map(({ kind, title, text, icon: Icon }) => (
            <Card key={kind}>
              <CardContent className="p-5">
                <Icon className="text-success size-6" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-2 min-h-10 text-sm">
                  {text}
                </p>
                <ConfirmDialog
                  trigger={
                    <Button className="mt-5 w-full" variant="outline">
                      Executar
                    </Button>
                  }
                  title={`${title}?`}
                  description={text}
                  pending={action.isPending}
                  onConfirm={() => action.mutate(kind)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Outbox</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Destinatários são mascarados e payloads sensíveis não são
              exibidos.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => outbox.refetch()}>
            <RefreshCw /> Atualizar
          </Button>
        </div>
        {outbox.isError ? (
          <PageError onRetry={() => outbox.refetch()} />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="p-3 text-left">Canal</th>
                  <th className="p-3 text-left">Destinatário</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Tentativas</th>
                  <th className="p-3 text-left">Próxima</th>
                  <th className="p-3 text-left">Criação / envio</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {outbox.data?.content?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">{item.channel}</td>
                    <td className="p-3">{maskRecipient(item.recipient)}</td>
                    <td className="p-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-3">{item.attempts ?? 0}</td>
                    <td className="p-3">
                      <DateTimeValue value={item.nextAttemptAt} />
                    </td>
                    <td className="p-3">
                      <DateTimeValue value={item.sentAt ?? item.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Roteiro de demonstração</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 sm:grid-cols-2">
            {[
              "Criar uma oferta MOCK.",
              "Criar produto com o mesmo externalId.",
              "Colocar o preço abaixo da meta.",
              "Executar a primeira consulta.",
              "Processar a rechecagem.",
              "Visualizar score e critérios.",
              "Processar a notificação.",
              "Abrir o alerta confirmado.",
              "Alterar vendedor, variante ou estoque.",
              "Repetir para demonstrar uma rejeição.",
            ].map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-lg border p-3 text-sm"
              >
                <span className="bg-primary text-primary-foreground grid size-6 shrink-0 place-items-center rounded-full text-xs">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
