import { ShieldX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PermissionDenied() {
  return (
    <Card>
      <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <span className="bg-destructive/10 text-destructive mb-4 grid size-14 place-items-center rounded-2xl">
          <ShieldX className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold">Acesso administrativo necessário</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Sua sessão está válida, mas esta área só pode ser usada por uma conta
          com a role ADMIN.
        </p>
        <Link
          className={buttonVariants({ className: "mt-5" })}
          href="/dashboard"
        >
          Voltar ao dashboard
        </Link>
      </CardContent>
    </Card>
  );
}
