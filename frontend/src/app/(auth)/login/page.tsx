import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/auth-form";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <p className="text-success text-xs font-semibold tracking-[0.18em] uppercase">
        Área segura
      </p>
      <h1 className="mt-2 text-2xl font-bold">Entre na sua conta</h1>
      <p className="text-muted-foreground mt-2 mb-7 text-sm">
        Acompanhe produtos, rechecagens e alertas confirmados.
      </p>
      <Suspense fallback={<p>Carregando formulário...</p>}>
        <LoginForm />
      </Suspense>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Ainda não possui conta?{" "}
        <Link
          className="text-foreground font-semibold hover:underline"
          href="/register"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
