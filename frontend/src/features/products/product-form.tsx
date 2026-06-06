"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product, ProductInput } from "@/lib/api/types";
import {
  parseLocalizedMoney,
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schemas";

function FormField({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
      {error && (
        <p className="text-destructive mt-1 text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProductForm({
  product,
  pending,
  onSubmit,
}: {
  product?: Product;
  pending?: boolean;
  onSubmit: (payload: ProductInput) => void;
}) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      providerCode:
        product?.providerCode === "MERCADO_LIVRE" ? "MERCADO_LIVRE" : "MOCK",
      externalId: product?.externalId ?? "",
      sourceUrl: product?.sourceUrl ?? "",
      title: product?.title ?? "",
      brand: product?.brand ?? "",
      model: product?.model ?? "",
      color: product?.color ?? "",
      storage: product?.storage ?? "",
      condition: product?.condition ?? "NEW",
      targetPrice: product?.targetPrice?.toFixed(2).replace(".", ",") ?? "",
      currency: product?.currency ?? "BRL",
      checkIntervalMinutes: product?.checkIntervalMinutes ?? 30,
    },
  });

  const field = (name: keyof ProductFormValues) =>
    form.formState.errors[name]?.message;

  return (
    <form
      className="space-y-7"
      onSubmit={form.handleSubmit((values) =>
        onSubmit({
          ...values,
          targetPrice: parseLocalizedMoney(values.targetPrice),
          brand: values.brand || undefined,
          model: values.model || undefined,
          color: values.color || undefined,
          storage: values.storage || undefined,
        }),
      )}
      noValidate
    >
      <section className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="providerCode">Provedor</Label>
          <select
            id="providerCode"
            className="border-input bg-background mt-2 h-9 w-full rounded-lg border px-3 text-sm disabled:opacity-60"
            disabled={Boolean(product)}
            {...form.register("providerCode")}
          >
            <option value="MOCK">MOCK (demonstração)</option>
            <option value="MERCADO_LIVRE">Mercado Livre</option>
          </select>
          {product && (
            <p className="text-muted-foreground mt-1 text-xs">
              O backend não permite alterar o provedor depois da criação.
            </p>
          )}
        </div>
        <FormField
          htmlFor="externalId"
          label="Identificador externo"
          error={field("externalId")}
        >
          <Input
            id="externalId"
            disabled={Boolean(product)}
            {...form.register("externalId")}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField
            htmlFor="sourceUrl"
            label="URL da oferta"
            error={field("sourceUrl")}
          >
            <Input id="sourceUrl" type="url" {...form.register("sourceUrl")} />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField
            htmlFor="title"
            label="Título do produto"
            error={field("title")}
          >
            <Input id="title" {...form.register("title")} />
          </FormField>
        </div>
        <FormField htmlFor="brand" label="Marca" error={field("brand")}>
          <Input id="brand" {...form.register("brand")} />
        </FormField>
        <FormField htmlFor="model" label="Modelo" error={field("model")}>
          <Input id="model" {...form.register("model")} />
        </FormField>
        <FormField htmlFor="color" label="Cor" error={field("color")}>
          <Input id="color" {...form.register("color")} />
        </FormField>
        <FormField
          htmlFor="storage"
          label="Armazenamento / variante"
          error={field("storage")}
        >
          <Input id="storage" {...form.register("storage")} />
        </FormField>
        <FormField
          htmlFor="condition"
          label="Condição"
          error={field("condition")}
        >
          <Input
            id="condition"
            placeholder="NEW"
            {...form.register("condition")}
          />
        </FormField>
      </section>

      <section className="bg-muted/50 grid gap-5 rounded-xl border p-5 sm:grid-cols-3">
        <FormField
          htmlFor="targetPrice"
          label="Preço desejado"
          error={field("targetPrice")}
        >
          <Input
            id="targetPrice"
            inputMode="decimal"
            placeholder="3.499,00"
            {...form.register("targetPrice")}
          />
        </FormField>
        <FormField htmlFor="currency" label="Moeda" error={field("currency")}>
          <Input id="currency" maxLength={3} {...form.register("currency")} />
        </FormField>
        <FormField
          htmlFor="checkIntervalMinutes"
          label="Intervalo (minutos)"
          error={field("checkIntervalMinutes")}
        >
          <Input
            id="checkIntervalMinutes"
            type="number"
            min={5}
            {...form.register("checkIntervalMinutes", { valueAsNumber: true })}
          />
        </FormField>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" />}
          {product ? "Salvar alterações" : "Começar monitoramento"}
        </Button>
      </div>
    </form>
  );
}
