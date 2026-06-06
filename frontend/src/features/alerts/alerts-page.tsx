"use client";

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageError } from "@/components/feedback/page-error";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateTimeValue, MoneyValue } from "@/components/shared/values";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProduct } from "@/features/products/api";
import { listAlerts, markAlertRead } from "@/features/alerts/api";
import { ApiError } from "@/lib/api/problem-details";
import { queryKeys } from "@/lib/api/query-keys";
import type { Alert } from "@/lib/api/types";
import {
  calculateSavings,
  formatPayment,
  formatPercent,
} from "@/lib/formatters";

function AlertCard({
  alert,
  productTitle,
}: {
  alert: Alert;
  productTitle?: string;
}) {
  const queryClient = useQueryClient();
  const markRead = useMutation({
    mutationFn: () => markAlertRead(alert.id ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alerta marcado como lido.");
    },
    onError: () => toast.error("Não foi possível marcar o alerta."),
  });
  const savings = calculateSavings(alert.targetPrice, alert.verifiedPrice);

  return (
    <Card className={!alert.readAt ? "border-success/40" : undefined}>
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {!alert.readAt && (
              <span
                className="bg-success size-2 rounded-full"
                aria-label="Não lido"
              />
            )}
            <StatusBadge status={alert.status} />
            <ConfidenceBadge
              confidence={alert.confidence}
              score={alert.confidenceScore}
            />
          </div>
          <Link
            href={`/alerts/${alert.id}`}
            className="mt-4 block text-lg font-semibold hover:underline"
          >
            {productTitle ?? `Produto ${alert.trackedProductId?.slice(0, 8)}`}
          </Link>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <MoneyValue
              value={alert.verifiedPrice}
              currency={alert.currency}
              className="text-2xl font-bold"
            />
            <span className="text-success text-sm font-semibold">
              Economia de{" "}
              <MoneyValue value={savings.amount} currency={alert.currency} /> (
              {formatPercent(savings.percentage)})
            </span>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            {formatPayment(alert.paymentType)} · vendedor{" "}
            {alert.sellerId ?? "não informado"} ·{" "}
            <DateTimeValue value={alert.createdAt} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!alert.readAt && (
            <Button
              variant="outline"
              disabled={markRead.isPending}
              onClick={() => markRead.mutate()}
            >
              <CheckCheck /> Marcar como lido
            </Button>
          )}
          <Link href={`/alerts/${alert.id}`} className={buttonVariants()}>
            Ver detalhes
          </Link>
          {alert.sourceUrl && (
            <a
              href={alert.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label="Abrir oferta na loja"
            >
              <ExternalLink />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [read, setRead] = useState("");
  const filters = {
    page,
    size: 10,
    status: status
      ? (status as
          | "CREATED"
          | "NOTIFICATION_PENDING"
          | "NOTIFIED"
          | "NOTIFICATION_FAILED"
          | "EXPIRED")
      : undefined,
    read: read === "" ? undefined : read === "true",
  };
  const alerts = useQuery({
    queryKey: queryKeys.alerts(filters),
    queryFn: () => listAlerts(filters),
  });
  const productIds = [
    ...new Set(
      alerts.data?.content
        ?.map((alert) => alert.trackedProductId)
        .filter((id): id is string => Boolean(id)) ?? [],
    ),
  ];
  const products = useQueries({
    queries: productIds.map((id) => ({
      queryKey: queryKeys.product(id),
      queryFn: () => getProduct(id),
      staleTime: 60_000,
    })),
  });
  const titles = new Map(
    products.map((query, index) => [productIds[index], query.data?.title]),
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Ofertas confirmadas"
        title="Alertas"
        description="Cada alerta abaixo foi persistido após uma dupla verificação aprovada pelo backend."
      />
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <select
            className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            aria-label="Filtrar status do alerta"
          >
            <option value="">Todos os status</option>
            <option value="CREATED">Criado</option>
            <option value="NOTIFICATION_PENDING">Notificação pendente</option>
            <option value="NOTIFIED">Notificado</option>
            <option value="NOTIFICATION_FAILED">Falha na notificação</option>
            <option value="EXPIRED">Expirado</option>
          </select>
          <select
            className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
            value={read}
            onChange={(event) => {
              setRead(event.target.value);
              setPage(0);
            }}
            aria-label="Filtrar leitura"
          >
            <option value="">Lidos e não lidos</option>
            <option value="false">Não lidos</option>
            <option value="true">Lidos</option>
          </select>
        </CardContent>
      </Card>

      {alerts.isLoading && <PageSkeleton />}
      {alerts.isError && (
        <PageError
          message={
            alerts.error instanceof ApiError
              ? alerts.error.problem.message
              : undefined
          }
          onRetry={() => alerts.refetch()}
        />
      )}
      {alerts.data && (alerts.data.content?.length ?? 0) === 0 && (
        <EmptyState
          title="Nenhum alerta encontrado"
          description="Quando uma oferta alcançar a meta e for aprovada na segunda consulta, ela aparecerá aqui."
        />
      )}
      <div className="space-y-4">
        {alerts.data?.content?.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            productTitle={
              alert.trackedProductId
                ? titles.get(alert.trackedProductId)
                : undefined
            }
          />
        ))}
      </div>
      {alerts.data && (
        <PaginationControls
          page={Number(alerts.data.page?.number ?? 0)}
          totalPages={Number(alerts.data.page?.totalPages ?? 1)}
          totalElements={Number(alerts.data.page?.totalElements ?? 0)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
