import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome.").max(120),
    email: z.email("Informe um e-mail válido.").max(255),
    password: z
      .string()
      .min(8, "Use pelo menos 8 caracteres.")
      .max(72, "Use no máximo 72 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });
