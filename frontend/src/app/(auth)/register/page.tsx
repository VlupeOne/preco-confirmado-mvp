import Link from "next/link";

import { RegisterForm } from "@/features/auth/auth-form";

export const metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <p className="text-success text-xs font-semibold tracking-[0.18em] uppercase">
        Comece agora
      </p>
      <h1 className="mt-2 text-2xl font-bold">Crie sua conta</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">
        Cadastre o primeiro produto e deixe a dupla verificação trabalhar.
      </p>
      <RegisterForm />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Já possui conta?{" "}
        <Link
          className="text-foreground font-semibold hover:underline"
          href="/login"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
