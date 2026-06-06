"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageError } from "@/components/feedback/page-error";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { ProductForm } from "@/features/products/product-form";
import {
  createProduct,
  getProduct,
  updateProduct,
} from "@/features/products/api";
import { ApiError } from "@/lib/api/problem-details";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProductInput } from "@/lib/api/types";

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const product = useQuery({
    queryKey: productId ? queryKeys.product(productId) : ["new-product"],
    queryFn: () => getProduct(productId ?? ""),
    enabled: Boolean(productId),
  });
  const mutation = useMutation({
    mutationFn: (payload: ProductInput) =>
      productId
        ? updateProduct({ id: productId, payload })
        : createProduct(payload),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.setQueryData(queryKeys.product(saved.id ?? ""), saved);
      toast.success(productId ? "Produto atualizado." : "Produto monitorado.");
      router.push(`/products/${saved.id}`);
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.problem.message
          : "Não foi possível salvar o produto.",
      ),
  });

  if (productId && product.isLoading) return <PageSkeleton cards={2} />;
  if (productId && product.isError) {
    return <PageError onRetry={() => product.refetch()} />;
  }

  return (
    <ProductForm
      product={product.data}
      pending={mutation.isPending}
      onSubmit={(payload) => mutation.mutate(payload)}
    />
  );
}
