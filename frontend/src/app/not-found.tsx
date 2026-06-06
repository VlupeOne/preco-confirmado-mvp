import { SearchX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="conteudo-principal"
      className="grid min-h-dvh place-items-center p-6 text-center"
    >
      <div>
        <SearchX className="text-muted-foreground mx-auto size-12" />
        <h1 className="mt-5 text-2xl font-bold">Página não encontrada</h1>
        <p className="text-muted-foreground mt-2">
          O endereço informado não existe ou não está mais disponível.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-5" })}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
