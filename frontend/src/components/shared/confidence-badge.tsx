import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function ConfidenceBadge({
  confidence,
  score,
}: {
  confidence?: string;
  score?: number;
}) {
  const Icon =
    confidence === "HIGH"
      ? ShieldCheck
      : confidence === "MEDIUM"
        ? ShieldQuestion
        : ShieldAlert;
  const label =
    confidence === "HIGH"
      ? "Alta"
      : confidence === "MEDIUM"
        ? "Média"
        : confidence === "LOW"
          ? "Baixa"
          : "Pendente";

  return (
    <Badge
      variant="outline"
      className={
        confidence === "HIGH"
          ? "border-success/30 bg-success/10 text-success"
          : confidence === "MEDIUM"
            ? "border-warning/30 bg-warning/10 text-warning"
            : "border-destructive/30 bg-destructive/10 text-destructive"
      }
    >
      <Icon aria-hidden="true" />
      Confiança {label}
      {score !== undefined ? ` · ${score}/100` : ""}
    </Badge>
  );
}
