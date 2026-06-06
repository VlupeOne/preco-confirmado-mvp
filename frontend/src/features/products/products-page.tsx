"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageError } from "@/components/feedback/page-error";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateTimeValue, MoneyValue } from "@/components/shared/values";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  checkProductNow,
  listProducts,
  pauseProduct,
  removeProduct,
  resumeProduct,
} from "@/features/products/api";
import { ApiError } from "@/lib/api/problem-details";
import { queryKeys } from "@/lib/api/query-keys";
import type { Product } from "@/lib/api/types";

function ProductActions({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (action: "pause" | "resume" | "check" | "remove") => {
      if (!product.id) return;
      if (action === "pause") await pauseProduct(product.id);
      if (action === "resume") await resumeProduct(product.id);
      if (action === "check") await checkProductNow(product.id);
      if (action === "remove") await removeProduct(product.id);
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (product.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.product(product.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.history(product.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.verifications(product.id),
        });
      }
      toast.success(
        action === "check"
          ? "Consulta solicitada. Uma rechecagem pode ser criada."
          : "Produto atualizado.",
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.problem.message
          : "Ação não concluída.",
      ),
  });

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Verificar agora"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate("check")}
      >
        <RefreshCw />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
          <span className="sr-only">Mais ações</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/products/${product.id}`} />}>
            <Eye /> Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              mutation.mutate(product.status === "PAUSED" ? "resume" : "pause")
            }
          >
            {product.status === "PAUSED" ? <Play /> : <Pause />}
            {product.status === "PAUSED" ? "Retomar" : "Pausar"}
          </DropdownMenuItem>
          <ConfirmDialog
            trigger={
              <DropdownMenuItem
                variant="destructive"
                closeOnClick={false}
                onClick={(event) => event.preventDefault()}
              >
                <Trash2 /> Remover
              </DropdownMenuItem>
            }
            title="Remover produto monitorado?"
            description="A remoção é lógica no backend e interrompe novas consultas. Esta ação não usa atualização otimista."
            confirmLabel="Remover"
            destructive
            pending={mutation.isPending}
            onConfirm={() => mutation.mutate("remove")}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ProductsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const filters = {
    page,
    size: 10,
    status: status
      ? (status as "ACTIVE" | "PAUSED" | "ERROR" | "DELETED")
      : undefined,
    provider: provider || undefined,
  };
  const products = useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => listProducts(filters),
  });

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Monitoramento"
        title="Produtos monitorados"
        description="Gerencie as metas e solicite consultas. O alerta só é criado após a aprovação da segunda verificação."
        actions={
          <Link href="/products/new" className={buttonVariants()}>
            <Plus /> Monitorar produto
          </Link>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value=""
              disabled
              className="pl-9"
              placeholder="Busca textual não suportada pela API"
              aria-label="Busca indisponível"
            />
          </div>
          <select
            className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="PAUSED">Pausados</option>
            <option value="ERROR">Com erro</option>
          </select>
          <select
            className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
            value={provider}
            onChange={(event) => {
              setProvider(event.target.value);
              setPage(0);
            }}
            aria-label="Filtrar por provedor"
          >
            <option value="">Todos os provedores</option>
            <option value="MOCK">MOCK</option>
            <option value="MERCADO_LIVRE">Mercado Livre</option>
          </select>
        </CardContent>
      </Card>

      {products.isLoading && <PageSkeleton />}
      {products.isError && (
        <PageError
          message={
            products.error instanceof ApiError
              ? products.error.problem.message
              : undefined
          }
          onRetry={() => products.refetch()}
        />
      )}
      {products.data && (products.data.content?.length ?? 0) === 0 && (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Cadastre um produto ou ajuste os filtros atuais."
          action={
            <Link href="/products/new" className={buttonVariants()}>
              <Plus /> Monitorar produto
            </Link>
          }
        />
      )}

      {products.data && (products.data.content?.length ?? 0) > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-xl border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="p-3 text-left font-medium">Produto</th>
                  <th className="p-3 text-left font-medium">Meta</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Última consulta</th>
                  <th className="p-3 text-left font-medium">
                    Próxima consulta
                  </th>
                  <th className="p-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.data.content?.map((product) => (
                  <tr key={product.id} className="bg-card">
                    <td className="p-3">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.title}
                      </Link>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {product.providerCode} · {product.externalId}
                      </p>
                    </td>
                    <td className="p-3 font-semibold">
                      <MoneyValue
                        value={product.targetPrice}
                        currency={product.currency}
                      />
                    </td>
                    <td className="p-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="p-3">
                      <DateTimeValue value={product.lastCheckedAt} />
                    </td>
                    <td className="p-3">
                      <DateTimeValue value={product.nextCheckAt} />
                    </td>
                    <td className="p-3">
                      <ProductActions product={product} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 md:hidden">
            {products.data.content?.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-semibold"
                      >
                        {product.title}
                      </Link>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {product.providerCode} · {product.externalId}
                      </p>
                    </div>
                    <ProductActions product={product} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Preço desejado
                      </p>
                      <MoneyValue
                        value={product.targetPrice}
                        currency={product.currency}
                        className="font-semibold"
                      />
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <PaginationControls
            page={Number(products.data.page?.number ?? 0)}
            totalPages={Number(products.data.page?.totalPages ?? 1)}
            totalElements={Number(products.data.page?.totalElements ?? 0)}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
