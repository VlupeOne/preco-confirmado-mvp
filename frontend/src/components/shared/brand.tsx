import { BadgeCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 font-semibold", className)}
      aria-label="PreçoConfirmado - página inicial"
    >
      <span className="bg-primary text-primary-foreground relative grid size-9 place-items-center rounded-xl shadow-sm">
        <ShieldCheck className="size-5" aria-hidden="true" />
        <BadgeCheck className="text-success absolute -right-1 -bottom-1 size-4 fill-current stroke-white" />
      </span>
      {!compact && (
        <span className="text-lg tracking-tight">
          Preço<span className="text-success">Confirmado</span>
        </span>
      )}
    </Link>
  );
}
