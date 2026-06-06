import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const timeZone = "America/Sao_Paulo";

export function formatMoney(value?: number | null, currency = "BRL"): string {
  if (value === undefined || value === null || !Number.isFinite(value))
    return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatPercent(value?: number | null): string {
  if (value === undefined || value === null || !Number.isFinite(value))
    return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function validDate(value?: string | null) {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function formatDate(value?: string | null): string {
  const date = validDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone,
  }).format(date);
}

export function formatDateTime(value?: string | null): string {
  const date = validDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatRelativeTime(value?: string | null): string {
  const date = validDate(value);
  if (!date) return "—";
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: ptBR });
}

export function formatChartDate(value?: string | null): string {
  const date = validDate(value);
  return date ? format(date, "dd/MM HH:mm", { locale: ptBR }) : "—";
}

export function calculateSavings(target?: number, verified?: number) {
  if (
    target === undefined ||
    verified === undefined ||
    target <= 0 ||
    !Number.isFinite(target) ||
    !Number.isFinite(verified)
  ) {
    return { amount: 0, percentage: 0 };
  }
  const amount = Math.max(0, target - verified);
  return { amount, percentage: amount / target };
}

export function formatPayment(value?: string | null) {
  const values: Record<string, string> = {
    PIX: "Pix",
    CREDIT_CARD: "Cartão de crédito",
    BOLETO: "Boleto",
    UNKNOWN: "Não identificado",
  };
  return values[value ?? ""] ?? value ?? "—";
}
