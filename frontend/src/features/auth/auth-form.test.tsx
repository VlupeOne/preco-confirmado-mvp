import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

import { LoginForm, RegisterForm } from "@/features/auth/auth-form";
import { server } from "@/test/mocks/server";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function renderForm(form: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{form}</QueryClientProvider>,
  );
}

it("envia login e navega para o dashboard", async () => {
  server.use(
    http.post("*/api/auth/login", () =>
      HttpResponse.json({ authenticated: true }),
    ),
    http.get("*/api/auth/session", () =>
      HttpResponse.json({
        user: { id: "1", name: "Ana", email: "ana@example.com", role: "USER" },
      }),
    ),
  );
  const user = userEvent.setup();
  renderForm(<LoginForm />);

  await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
  await user.type(screen.getByLabelText("Senha"), "Password123");
  await user.click(
    screen.getByRole("button", { name: /entrar com segurança/i }),
  );

  await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
});

it("associa erro de campo retornado pelo backend no cadastro", async () => {
  server.use(
    http.post("*/api/auth/register", () =>
      HttpResponse.json(
        {
          status: 400,
          violations: [{ field: "email", message: "E-mail já cadastrado" }],
        },
        { status: 400 },
      ),
    ),
  );
  const user = userEvent.setup();
  renderForm(<RegisterForm />);

  await user.type(screen.getByLabelText("Nome"), "Ana Silva");
  await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
  await user.type(
    screen.getByLabelText("Senha", { exact: true }),
    "Password123",
  );
  await user.type(screen.getByLabelText("Confirmar senha"), "Password123");
  await user.click(screen.getByRole("button", { name: /criar minha conta/i }));

  expect(await screen.findByText("E-mail já cadastrado")).toBeVisible();
});
