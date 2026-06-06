"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MockOffer, MockOfferInput } from "@/lib/api/types";
import { parseLocalizedMoney } from "@/features/products/schemas";

const mockOfferSchema = z.object({
  externalId: z.string().trim().min(1),
  title: z.string().trim().min(2),
  price: z.string().refine((value) => parseLocalizedMoney(value) > 0),
  regularPrice: z.string(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  paymentType: z.enum(["PIX", "CREDIT_CARD", "BOLETO", "UNKNOWN"]),
  sellerId: z.string(),
  sellerName: z.string(),
  condition: z.string().min(1),
  color: z.string(),
  storage: z.string(),
  inStock: z.boolean(),
  availableQuantity: z.number().int().min(0),
  couponRequired: z.boolean(),
  couponCode: z.string(),
  sourceUrl: z.url(),
});

type Values = z.infer<typeof mockOfferSchema>;

export function MockOfferForm({
  offer,
  pending,
  onSubmit,
}: {
  offer?: MockOffer;
  pending?: boolean;
  onSubmit: (payload: MockOfferInput) => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(mockOfferSchema),
    defaultValues: {
      externalId: offer?.externalId ?? "DEMO-001",
      title: offer?.title ?? "Notebook Demo 16 GB 512 GB",
      price: String(offer?.price ?? "3999").replace(".", ","),
      regularPrice: String(offer?.regularPrice ?? "4299").replace(".", ","),
      currency: offer?.currency ?? "BRL",
      paymentType: offer?.paymentType ?? "PIX",
      sellerId: offer?.sellerId ?? "SELLER-DEMO",
      sellerName: offer?.sellerName ?? "Loja Demonstração",
      condition: offer?.condition ?? "NEW",
      color: offer?.color ?? "Preto",
      storage: offer?.storage ?? "512GB",
      inStock: offer?.inStock ?? true,
      availableQuantity: offer?.availableQuantity ?? 5,
      couponRequired: offer?.couponRequired ?? false,
      couponCode: offer?.couponCode ?? "",
      sourceUrl:
        offer?.sourceUrl ?? "https://loja-teste.local/produtos/demo-001",
    },
  });

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((values) =>
        onSubmit({
          ...values,
          price: parseLocalizedMoney(values.price),
          regularPrice: values.regularPrice
            ? parseLocalizedMoney(values.regularPrice)
            : undefined,
          sellerId: values.sellerId || undefined,
          sellerName: values.sellerName || undefined,
          color: values.color || undefined,
          storage: values.storage || undefined,
          couponCode: values.couponCode || undefined,
        }),
      )}
    >
      {Object.entries({
        externalId: "Identificador externo",
        title: "Título",
        price: "Preço",
        regularPrice: "Preço regular",
        currency: "Moeda",
        sellerId: "ID do vendedor",
        sellerName: "Nome do vendedor",
        condition: "Condição",
        color: "Cor",
        storage: "Armazenamento",
        availableQuantity: "Quantidade",
        couponCode: "Cupom",
        sourceUrl: "URL da oferta",
      }).map(([name, label]) => (
        <div
          key={name}
          className={
            name === "title" || name === "sourceUrl" ? "sm:col-span-2" : ""
          }
        >
          <Label htmlFor={`mock-${name}`}>{label}</Label>
          <Input
            id={`mock-${name}`}
            className="mt-2"
            type={
              name === "availableQuantity"
                ? "number"
                : name === "sourceUrl"
                  ? "url"
                  : "text"
            }
            disabled={name === "externalId" && Boolean(offer)}
            {...form.register(name as keyof Values, {
              valueAsNumber: name === "availableQuantity",
            })}
          />
        </div>
      ))}
      <div>
        <Label htmlFor="mock-payment">Pagamento</Label>
        <select
          id="mock-payment"
          className="border-input bg-background mt-2 h-9 w-full rounded-lg border px-3 text-sm"
          {...form.register("paymentType")}
        >
          <option value="PIX">Pix</option>
          <option value="CREDIT_CARD">Cartão</option>
          <option value="BOLETO">Boleto</option>
          <option value="UNKNOWN">Desconhecido</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-5 pt-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("inStock")} /> Em estoque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("couponRequired")} /> Exige
          cupom
        </label>
      </div>
      {form.formState.errors.root && (
        <p className="text-destructive text-sm sm:col-span-2">
          Revise os dados da oferta.
        </p>
      )}
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : offer
              ? "Atualizar oferta"
              : "Criar oferta"}
        </Button>
      </div>
    </form>
  );
}
