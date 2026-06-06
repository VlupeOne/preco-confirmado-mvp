"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  Check,
  Clock3,
  ExternalLink,
  Pencil,
  RefreshCw,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { toast } from "sonner";

import { PriceHistoryChart } from "@/components/charts/price-history-chart";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageError } from "@/components/feedback/page-error";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateTimeValue, MoneyValue } from "@/components/shared/values";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  checkProductNow,
  getProduct,
  getProductAlerts,
  getProductHistory,
  getProductVerifications,
} from "@/features/products/api";
import { parseVerificationReasons } from "@/features/verifications/reasons";
import { ApiError } from "@/lib/api/problem-details";
import { queryKeys } from "@/lib/api/query-keys";
import type { PriceSnapshot, Verification } from "@/lib/api/types";
import { calculateSavings, formatPayment } from "@/lib/formatters";

function Metric({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="mt-1 font-semibold">{children}</div>
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
    </div>
  );
}

function SnapshotSummary({
  label,
  snapshot,
}: {
  label: string;
  snapshot?: PriceSnapshot;
}) {
  return (
    <div className="bg-muted/45 rounded-xl border p-4">
      <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
      {snapshot ? (
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs">Preço</dt>
            <dd className="font-semibold">
              <MoneyValue value={snapshot.price} currency={snapshot.currency} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Consulta</dt>
            <dd>
              <DateTimeValue value={snapshot.observedAt} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Vendedor</dt>
            <dd>
              {snapshot.sellerName ?? snapshot.sellerId ?? "Não informado"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Pagamento</dt>
            <dd>{formatPayment(snapshot.paymentType)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Estoque</dt>
            <dd>{snapshot.inStock ? "Disponível" : "Indisponível"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Variante</dt>
            <dd>
              {[snapshot.color, snapshot.storage].filter(Boolean).join(" · ") ||
                "Não informada"}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          Ainda não disponível.
        </p>
      )}
    </div>
  );
}

export function VerificationCard({
  verification,
  snapshots,
}: {
  verification: Verification;
  snapshots: PriceSnapshot[];
}) {
  const reasons = parseVerificationReasons(verification.reasons);
  const first = snapshots.find(
    (item) => item.id === verification.firstSnapshotId,
  );
  const second = snapshots.find(
    (item) => item.id === verification.secondSnapshotId,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Verificação</CardTitle>
          <p className="text-muted-foreground mt-1 text-xs">
            Iniciada <DateTimeValue value={verification.startedAt} />
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <StatusBadge status={verification.status} />
          {verification.score !== undefined && (
            <ConfidenceBadge
              confidence={verification.confidence}
              score={verification.score}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {verification.status === "PENDING_RECHECK" && (
          <Alert>
            <Clock3 />
            <AlertTitle>Uma segunda consulta ainda será realizada</AlertTitle>
            <AlertDescription>
              Rechecagem prevista para{" "}
              <DateTimeValue value={verification.recheckAfter} />.
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <SnapshotSummary label="Primeira verificação" snapshot={first} />
          <SnapshotSummary label="Segunda verificação" snapshot={second} />
        </div>
        {reasons.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold">
              Critérios avaliados pelo backend
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {reasons.map((reason) => (
                <li
                  key={reason.code}
                  className={
                    reason.approved
                      ? "bg-success/8 text-success flex items-center gap-2 rounded-lg border p-3 text-sm"
                      : "bg-destructive/8 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm"
                  }
                >
                  {reason.approved ? <Check /> : <X />}
                  {reason.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        {verification.status === "REJECTED" &&
          reasons.find((reason) => !reason.approved) && (
            <p className="text-destructive text-sm font-semibold">
              Principal motivo:{" "}
              {reasons.find((reason) => !reason.approved)?.label}
            </p>
          )}
      </CardContent>
    </Card>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const pollCount = useRef(0);
  const product = useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProduct(id),
  });
  const history = useQuery({
    queryKey: queryKeys.history(id),
    queryFn: () => getProductHistory(id),
  });
  const verifications = useQuery({
    queryKey: queryKeys.verifications(id),
    queryFn: () => getProductVerifications(id),
    refetchInterval: (query) => {
      const pending = query.state.data?.content?.some(
        (item) => item.status === "PENDING_RECHECK",
      );
      if (pending && pollCount.current < 12) {
        pollCount.current += 1;
        return 5_000;
      }
      return false;
    },
  });
  const alerts = useQuery({
    queryKey: queryKeys.alerts({ productId: id }),
    queryFn: () => getProductAlerts(id),
  });
  const check = useMutation({
    mutationFn: () => checkProductNow(id),
    onSuccess: async () => {
      pollCount.current = 0;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.product(id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history(id) }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.verifications(id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.alerts({ productId: id }),
        }),
      ]);
      toast.success(
        "Consulta solicitada. A primeira etapa pode criar uma rechecagem pendente.",
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.problem.message
          : "Consulta não iniciada.",
      ),
  });

  if (
    product.isLoading ||
    history.isLoading ||
    verifications.isLoading ||
    alerts.isLoading
  ) {
    return <PageSkeleton />;
  }
  if (product.isError || !product.data) {
    return <PageError onRetry={() => product.refetch()} />;
  }

  const snapshots = history.data?.content ?? [];
  const latest = snapshots.at(-1);
  const difference =
    latest?.price !== undefined && product.data.targetPrice !== undefined
      ? latest.price - product.data.targetPrice
      : undefined;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Detalhe do produto"
        title={product.data.title ?? "Produto monitorado"}
        description={`${product.data.providerCode} · ${product.data.externalId}`}
        actions={
          <>
            <Link
              href={`/products/${id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Pencil /> Editar
            </Link>
            <Button disabled={check.isPending} onClick={() => check.mutate()}>
              <RefreshCw className={check.isPending ? "animate-spin" : ""} />
              Verificar agora
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={product.data.status} />
        {product.data.color && (
          <span className="bg-muted rounded-full px-3 py-1 text-xs">
            {product.data.color}
          </span>
        )}
        {product.data.storage && (
          <span className="bg-muted rounded-full px-3 py-1 text-xs">
            {product.data.storage}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <Metric label="Preço desejado">
              <MoneyValue
                value={product.data.targetPrice}
                currency={product.data.currency}
              />
            </Metric>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Metric
              label="Último preço encontrado"
              hint={
                latest
                  ? "Snapshot mais recente"
                  : "Aguardando primeira consulta"
              }
            >
              <MoneyValue
                value={latest?.price}
                currency={latest?.currency ?? product.data.currency}
              />
            </Metric>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Metric label="Diferença até a meta">
              {difference === undefined ? (
                "—"
              ) : (
                <span
                  className={difference <= 0 ? "text-success" : "text-warning"}
                >
                  <ArrowDown className="mr-1 inline size-4" />
                  <MoneyValue
                    value={Math.abs(difference)}
                    currency={product.data.currency}
                  />
                </span>
              )}
            </Metric>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Metric
              label="Estoque e próxima consulta"
              hint={
                latest?.inStock
                  ? "Estoque disponível"
                  : latest
                    ? "Sem estoque"
                    : "Estoque não consultado"
              }
            >
              <DateTimeValue value={product.data.nextCheckAt} />
            </Metric>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList
          className="w-full justify-start overflow-x-auto"
          variant="line"
        >
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="verifications">Verificações</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-5">
          {snapshots.length === 0 ? (
            <EmptyState
              title="Histórico vazio"
              description="Execute uma verificação para registrar o primeiro snapshot."
            />
          ) : (
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do preço</CardTitle>
                </CardHeader>
                <CardContent>
                  <PriceHistoryChart
                    snapshots={snapshots}
                    targetPrice={product.data.targetPrice}
                    currency={product.data.currency}
                  />
                </CardContent>
              </Card>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="p-3 text-left">Data</th>
                      <th className="p-3 text-left">Preço</th>
                      <th className="p-3 text-left">Vendedor</th>
                      <th className="p-3 text-left">Pagamento</th>
                      <th className="p-3 text-left">Estoque</th>
                      <th className="p-3 text-left">Variante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[...snapshots].reverse().map((snapshot) => (
                      <tr key={snapshot.id}>
                        <td className="p-3">
                          <DateTimeValue value={snapshot.observedAt} />
                        </td>
                        <td className="p-3 font-semibold">
                          <MoneyValue
                            value={snapshot.price}
                            currency={snapshot.currency}
                          />
                        </td>
                        <td className="p-3">
                          {snapshot.sellerName ?? snapshot.sellerId ?? "—"}
                        </td>
                        <td className="p-3">
                          {formatPayment(snapshot.paymentType)}
                        </td>
                        <td className="p-3">
                          {snapshot.inStock ? "Disponível" : "Indisponível"}
                        </td>
                        <td className="p-3">
                          {[snapshot.color, snapshot.storage]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="verifications" className="mt-5 space-y-4">
          {(verifications.data?.content?.length ?? 0) === 0 ? (
            <EmptyState
              title="Nenhuma verificação"
              description="Uma verificação aparece quando o preço encontrado alcança a meta."
            />
          ) : (
            verifications.data?.content?.map((verification) => (
              <VerificationCard
                key={verification.id}
                verification={verification}
                snapshots={snapshots}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="alerts" className="mt-5 space-y-4">
          {(alerts.data?.content?.length ?? 0) === 0 ? (
            <EmptyState
              title="Nenhum alerta confirmado"
              description="Alertas aparecem somente após aprovação da dupla verificação."
            />
          ) : (
            alerts.data?.content?.map((alert) => {
              const savings = calculateSavings(
                alert.targetPrice,
                alert.verifiedPrice,
              );
              return (
                <Card key={alert.id}>
                  <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={alert.status} />
                        <ConfidenceBadge
                          confidence={alert.confidence}
                          score={alert.confidenceScore}
                        />
                      </div>
                      <p className="mt-4 text-2xl font-bold">
                        <MoneyValue
                          value={alert.verifiedPrice}
                          currency={alert.currency}
                        />
                      </p>
                      <p className="text-success mt-1 text-sm">
                        Economia de{" "}
                        <MoneyValue
                          value={savings.amount}
                          currency={alert.currency}
                        />
                      </p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Confirmado em <DateTimeValue value={alert.createdAt} />
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/alerts/${alert.id}`}
                        className={buttonVariants({ variant: "outline" })}
                      >
                        Ver alerta
                      </Link>
                      {alert.sourceUrl && (
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                          })}
                          aria-label="Abrir oferta"
                        >
                          <ExternalLink />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Alert>
        <ShoppingBag />
        <AlertTitle>A loja ainda pode alterar a oferta</AlertTitle>
        <AlertDescription>
          O preço é confirmado no horário indicado, mas pode mudar
          posteriormente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
