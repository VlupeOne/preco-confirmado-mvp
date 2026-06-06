import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function PageError({
  message = "Não foi possível carregar os dados.",
  traceId,
  onRetry,
}: {
  message?: string;
  traceId?: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive" aria-live="polite">
      <AlertTriangle aria-hidden="true" />
      <AlertTitle>Algo não saiu como esperado</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {traceId && (
          <button
            className="mt-2 font-mono text-xs underline"
            onClick={() => navigator.clipboard.writeText(traceId)}
          >
            Copiar código de diagnóstico: {traceId}
          </button>
        )}
        {onRetry && (
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
