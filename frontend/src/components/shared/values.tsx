import { formatDateTime, formatMoney } from "@/lib/formatters";

export function MoneyValue({
  value,
  currency = "BRL",
  className,
}: {
  value?: number | null;
  currency?: string;
  className?: string;
}) {
  return <span className={className}>{formatMoney(value, currency)}</span>;
}

export function DateTimeValue({
  value,
  className,
}: {
  value?: string | null;
  className?: string;
}) {
  return <time className={className}>{formatDateTime(value)}</time>;
}
