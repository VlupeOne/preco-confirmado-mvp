"use client";

import { useQueries } from "@tanstack/react-query";
import { BellRing, Box, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageError } from "@/components/feedback/page-error";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateTimeValue, MoneyValue } from "@/components/shared/values";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAlerts } from "@/features/alerts/api";
import { listProducts } from "@/features/products/api";
import { queryKeys } from "@/lib/api/query-keys";

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p className="text-muted-foreground mt-2 text-xs">{hint}</p>
        </div>
        <span className="bg-accent text-accent-foreground grid size-11 place-items-center rounded-xl">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const queries = useQueries({
    queries: [
      {
        queryKey: queryKeys.products({ dashboard: "total" }),
        queryFn: () => listProducts({ page: 0, size: 1 }),
      },
      {
        queryKey: queryKeys.products({ dashboard: "active" }),
        queryFn: () => listProducts({ page: 0, size: 1, status: "ACTIVE" }),
      },
      {
        queryKey: queryKeys.alerts({ dashboard: "unread" }),
        queryFn: () => listAlerts({ page: 0, size: 1, read: false }),
      },
      {
        queryKey: queryKeys.products({ dashboard: "recent" }),
        queryFn: () => listProducts({ page: 0, size: 5 }),
      },
      {
        queryKey: queryKeys.alerts({ dashboard: "recent" }),
        queryFn: () => listAlerts({ page: 0, size: 5 }),
      },
    ],
  });

  const loading = queries.some((query) => query.isLoading);
  const failed = queries.some((query) => query.isError);
  const [total, active, unread, recentProducts, recentAlerts] = queries;

  if (loading) return <PageSkeleton />;
  if (failed) {
    return (
      <PageError onRetry={() => queries.forEach((query) => query.refetch())} />
    );
  }

  const totalCount = Number(total.data?.page?.totalElements ?? 0);
  const activeCount = Number(active.data?.page?.totalElements ?? 0);
  const unreadCount = Number(unread.data?.page?.totalElements ?? 0);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Visão geral"
        title="Seu monitoramento"
        description="Indicadores calculados com metadados paginados da API, sem baixar todos os registros."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => queries.forEach((query) => query.refetch())}
            >
              <RefreshCw /> Atualizar
            </Button>
            <Link href="/products/new" className={buttonVariants()}>
              <Plus /> Monitorar produto
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Produtos monitorados"
          value={totalCount}
          hint="Todos os status visíveis"
          icon={Box}
        />
        <MetricCard
          label="Produtos ativos"
          value={activeCount}
          hint="Com novas consultas habilitadas"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Alertas não lidos"
          value={unreadCount}
          hint="Confirmações aguardando sua revisão"
          icon={BellRing}
        />
      </div>

      {totalCount === 0 ? (
        <EmptyState
          title="Comece pela sua primeira meta"
          description="Cadastre o produto, defina o preço desejado e acompanhe as duas verificações."
          action={
            <Link href="/products/new" className={buttonVariants()}>
              <Plus /> Monitorar produto
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos recentes</CardTitle>
              <Link
                href="/products"
                className="text-sm font-medium hover:underline"
              >
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentProducts.data?.content?.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="hover:bg-muted/60 flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {product.providerCode} · meta{" "}
                      <MoneyValue
                        value={product.targetPrice}
                        currency={product.currency}
                      />
                    </p>
                  </div>
                  <StatusBadge status={product.status} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alertas recentes</CardTitle>
              <Link
                href="/alerts"
                className="text-sm font-medium hover:underline"
              >
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {(recentAlerts.data?.content?.length ?? 0) === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  Nenhuma oferta foi confirmada ainda.
                </p>
              ) : (
                recentAlerts.data?.content?.map((alert) => (
                  <Link
                    href={`/alerts/${alert.id}`}
                    key={alert.id}
                    className="hover:bg-muted/60 block rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <MoneyValue
                        value={alert.verifiedPrice}
                        currency={alert.currency}
                        className="font-semibold"
                      />
                      <ConfidenceBadge
                        confidence={alert.confidence}
                        score={alert.confidenceScore}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Confirmado em <DateTimeValue value={alert.createdAt} />
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
