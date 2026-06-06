import {
  AlertCircle,
  CheckCircle2,
  CirclePause,
  Clock3,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  ERROR: "Com erro",
  DELETED: "Removido",
  PENDING_RECHECK: "Aguardando rechecagem",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  EXPIRED: "Expirada",
  PROVIDER_ERROR: "Erro no provedor",
  CREATED: "Criado",
  NOTIFICATION_PENDING: "Notificação pendente",
  NOTIFIED: "Notificado",
  NOTIFICATION_FAILED: "Falha na notificação",
  PENDING: "Pendente",
  PROCESSING: "Processando",
  SENT: "Enviado",
  FAILED: "Falhou",
  DEAD: "Encerrado",
};

export function StatusBadge({ status }: { status?: string }) {
  const positive = ["ACTIVE", "APPROVED", "NOTIFIED", "SENT"].includes(
    status ?? "",
  );
  const negative = [
    "ERROR",
    "REJECTED",
    "PROVIDER_ERROR",
    "NOTIFICATION_FAILED",
    "FAILED",
    "DEAD",
  ].includes(status ?? "");
  const paused = ["PAUSED", "EXPIRED", "DELETED"].includes(status ?? "");
  const Icon = positive
    ? CheckCircle2
    : negative
      ? XCircle
      : paused
        ? CirclePause
        : status
          ? Clock3
          : AlertCircle;

  return (
    <Badge
      variant="outline"
      className={
        positive
          ? "border-success/30 bg-success/10 text-success"
          : negative
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : paused
              ? "text-muted-foreground"
              : "border-warning/30 bg-warning/10 text-warning"
      }
    >
      <Icon aria-hidden="true" />
      {labels[status ?? ""] ?? status ?? "Não informado"}
    </Badge>
  );
}
