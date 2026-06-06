const reasonLabels: Record<string, string> = {
  product_and_variant_match: "Produto e variante correspondem",
  product_or_variant_mismatch: "Produto ou variante divergente",
  price_confirmed: "Preço confirmado nas duas consultas",
  price_changed_between_checks: "Preço mudou entre as consultas",
  stock_confirmed: "Estoque confirmado nas duas consultas",
  out_of_stock: "Produto sem estoque",
  seller_consistent: "Vendedor identificado e consistente",
  seller_missing_or_changed: "Vendedor ausente ou alterado",
  payment_consistent: "Forma de pagamento consistente",
  payment_missing_or_changed: "Pagamento ausente ou alterado",
  coupon_consistent: "Cupom consistente",
  coupon_changed: "Cupom mudou entre as consultas",
  recheck_within_validity: "Rechecagem dentro da janela de validade",
  recheck_expired: "Rechecagem fora da janela de validade",
  alert_eligibility_failed:
    "A oferta não cumpriu todos os critérios obrigatórios",
  serialization_error: "Os motivos não puderam ser serializados",
};

const approvedReasons = new Set([
  "product_and_variant_match",
  "price_confirmed",
  "stock_confirmed",
  "seller_consistent",
  "payment_consistent",
  "coupon_consistent",
  "recheck_within_validity",
]);

export type VerificationReason = {
  code: string;
  label: string;
  approved: boolean;
};

export function parseVerificationReasons(
  value?: string | null,
): VerificationReason[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((code) => ({
        code,
        label: reasonLabels[code] ?? code.replaceAll("_", " "),
        approved: approvedReasons.has(code),
      }));
  } catch {
    return [
      {
        code: "unparsed",
        label: value,
        approved: false,
      },
    ];
  }
}
