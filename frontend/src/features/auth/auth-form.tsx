"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register } from "@/features/auth/api";
import { loginSchema, registerSchema } from "@/lib/auth/schemas";
import { ApiError } from "@/lib/api/problem-details";
import { queryKeys } from "@/lib/api/query-keys";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-destructive mt-1 text-xs" role="alert">
      {message}
    </p>
  ) : null;
}

function PasswordInput({
  id,
  autoComplete,
  invalid,
  ...props
}: React.ComponentProps<typeof Input> & { invalid?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <LockKeyhole className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        className="pr-11 pl-9"
      />
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-md"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      const requested = searchParams.get("returnTo");
      const destination =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/dashboard";
      router.replace(destination);
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.problem.message : "Falha ao entrar.",
      );
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <div>
        <Label htmlFor="email">E-mail</Label>
        <div className="relative mt-2">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="pl-9"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </div>
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <div className="mt-2">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </div>
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending && <LoaderCircle className="animate-spin" />}
        Entrar com segurança
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        Seus tokens ficam protegidos em cookies HttpOnly e não são expostos ao
        navegador.
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const mutation = useMutation({
    mutationFn: register,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      toast.success("Conta criada. Bem-vindo ao PreçoConfirmado.");
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        error.problem.violations.forEach(({ field, message }) => {
          if (field in form.getValues()) {
            form.setError(field as keyof RegisterValues, { message });
          }
        });
        toast.error(error.problem.message);
      } else {
        toast.error("Não foi possível criar a conta.");
      }
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <div>
        <Label htmlFor="name">Nome</Label>
        <div className="relative mt-2">
          <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="name"
            autoComplete="name"
            className="pl-9"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
        </div>
        <FieldError message={form.formState.errors.name?.message} />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <div className="relative mt-2">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="pl-9"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </div>
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <div className="mt-2">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </div>
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="mt-2">
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            invalid={Boolean(form.formState.errors.confirmPassword)}
            {...form.register("confirmPassword")}
          />
        </div>
        <FieldError message={form.formState.errors.confirmPassword?.message} />
      </div>
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending && <LoaderCircle className="animate-spin" />}
        Criar minha conta
      </Button>
    </form>
  );
}
