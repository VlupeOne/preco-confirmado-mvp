"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCheck, ExternalLink, Info, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { PageError } from "@/components/feedback/page-error";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateTimeValue, MoneyValue } from "@/components/shared/values";
import {
  Alert as Notice,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAlert, markAlertRead } from "@/features/alerts/api";
import {
  getProduct,
  getProductHistory,
  getProductVerifications,
} from "@/features/products/api";
import { parseVerificationReasons } from "@/features/verifications/reasons";
import { queryKeys } from "@/lib/api/query-keys";
import {
  calculateSavings,
  formatPayment,
  formatPercent,
} from "@/lib/formatters";

export function AlertDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const alert = useQuery({
    queryKey: queryKeys.alert(id),
    queryFn: () => getAlert(id),
  });
  const productId = alert.data?.trackedProductId ?? "";
  const product = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });
  const verifications = useQuery({
    queryKey: queryKeys.verifications(productId),
    queryFn: () => getProductVerifications(productId, 100),
    enabled: Boolean(productId),
  });
  const history = useQuery({
    queryKey: queryKeys.history(productId),
    queryFn: () => getProductHistory(productId, 100),
    enabled: Boolean(productId),
  });
  const markRead = useMutation({
    mutationFn: () => markAlertRead(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.alert(id), updated);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alerta marcado como lido.");
    },
  });

  if (
    alert.isLoading ||
    product.isLoading ||
    verifications.isLoading ||
    history.isLoading
  )
    return <PageSkeleton />;
  if (alert.isError || !alert.data)
    return <PageError onRetry={() => alert.refetch()} />;

  const verification = verifications.data?.content?.find(
    (item) => item.id === alert.data.verificationAttemptId,
  );
  const reasons = parseVerificationReasons(verification?.reasons);
  const snapshot = history.data?.content?.find(
    (item) => item.id === verification?.secondSnapshotId,
  );
  const savings = calculateSavings(
    alert.data.targetPrice,
    alert.data.verifiedPrice,
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Oferta confirmada"
        title={product.data?.title ?? "Alerta de preço"}
        description={`Confirmado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(alert.data.createdAt ?? ""))}`}
        actions={
          <>
            {!alert.data.readAt && (
              <Button
                variant="outline"
                disabled={markRead.isPending}
                onClick={() => markRead.mutate()}
              >
                <CheckCheck /> Marcar como lido
              </Button>
            )}
            {alert.data.sourceUrl && (
              <a
                href={alert.data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants()}
              >
                Abrir oferta <ExternalLink />
              </a>
            )}
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={alert.data.status} />
        <ConfidenceBadge
          confidence={alert.data.confidence}
          score={alert.data.confidenceScore}
        />
        {!alert.data.readAt && (
          <span className="bg-success/10 text-success rounded-full px-3 py-1 text-xs font-semibold">
            Não lido
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs">Preço confirmado</p>
            <MoneyValue
              value={alert.data.verifiedPrice}
              currency={alert.data.currency}
              className="mt-1 block text-3xl font-bold"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs">Preço desejado</p>
            <MoneyValue
              value={alert.data.targetPrice}
              currency={alert.data.currency}
              className="mt-1 block text-3xl font-bold"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs">Economia confirmada</p>
            <p className="text-success mt-1 text-3xl font-bold">
              <MoneyValue
                value={savings.amount}
                currency={alert.data.currency}
              />
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {formatPercent(savings.percentage)} abaixo da meta
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da confirmação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs">Vendedor</p>
            <p className="mt-1 font-medium">
              {snapshot?.sellerName ?? alert.data.sellerId ?? "Não informado"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Pagamento</p>
            <p className="mt-1 font-medium">
              {formatPayment(alert.data.paymentType)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Variante</p>
            <p className="mt-1 font-medium">
              {[snapshot?.color, snapshot?.storage]
                .filter(Boolean)
                .join(" · ") || "Não informada"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Cupom</p>
            <p className="mt-1 font-medium">
              {snapshot?.couponRequired
                ? (snapshot.couponCode ?? "Obrigatório, código não informado")
                : "Não exigido"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Estoque</p>
            <p className="mt-1 font-medium">
              {snapshot
                ? snapshot.inStock
                  ? "Disponível"
                  : "Indisponível"
                : "Não informado"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Horário</p>
            <p className="mt-1 font-medium">
              <DateTimeValue value={alert.data.createdAt} />
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Produto</p>
            <Link
              className="mt-1 block font-medium hover:underline"
              href={`/products/${productId}`}
            >
              Abrir monitoramento
            </Link>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Score</p>
            <p className="mt-1 font-medium">
              {alert.data.confidenceScore ?? "—"}/100
            </p>
          </div>
        </CardContent>
      </Card>

      {reasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Critérios avaliados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {reasons.map((reason) => (
                <li
                  key={reason.code}
                  className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                >
                  {reason.approved ? (
                    <Check className="text-success" />
                  ) : (
                    <X className="text-destructive" />
                  )}
                  {reason.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Notice>
        <Info />
        <AlertTitle>Atenção ao horário da confirmação</AlertTitle>
        <AlertDescription>
          O preço foi confirmado no horário indicado, mas pode ser alterado
          posteriormente pela loja.
        </AlertDescription>
      </Notice>
    </div>
  );
}
