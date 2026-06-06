import { z } from "zod";

export function parseLocalizedMoney(value: string): number {
  const normalized = value.trim().replace(/\s/g, "");
  if (!normalized) return Number.NaN;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  const decimalSeparator =
    lastComma > lastDot ? "," : lastDot > lastComma ? "." : undefined;
  const thousandsSeparator = decimalSeparator === "," ? "." : ",";
  const withoutThousands = normalized.replaceAll(thousandsSeparator, "");
  const canonical = decimalSeparator
    ? withoutThousands.replace(decimalSeparator, ".")
    : withoutThousands;

  return Number(canonical.replace(/[^\d.-]/g, ""));
}

export const productFormSchema = z.object({
  providerCode: z.enum(["MOCK", "MERCADO_LIVRE"]),
  externalId: z.string().trim().min(1, "Informe o identificador.").max(120),
  sourceUrl: z
    .url("Informe uma URL HTTP(S) válida.")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "Informe uma URL HTTP(S) válida.",
    ),
  title: z.string().trim().min(2, "Informe o título.").max(500),
  brand: z.string().trim().max(120),
  model: z.string().trim().max(120),
  color: z.string().trim().max(80),
  storage: z.string().trim().max(80),
  condition: z.string().trim().min(1, "Informe a condição.").max(30),
  targetPrice: z.string().refine((value) => {
    const parsed = parseLocalizedMoney(value);
    return Number.isFinite(parsed) && parsed > 0;
  }, "Informe um preço maior que zero."),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use uma moeda com 3 letras."),
  checkIntervalMinutes: z
    .number()
    .int()
    .min(5, "O intervalo mínimo é de 5 minutos."),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
