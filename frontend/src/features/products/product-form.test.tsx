import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProductForm } from "@/features/products/product-form";

it("valida e envia o produto no formato do backend", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProductForm onSubmit={onSubmit} />);

  await user.clear(screen.getByLabelText("Identificador externo"));
  await user.type(screen.getByLabelText("Identificador externo"), "NOTE-1");
  await user.type(
    screen.getByLabelText("URL da oferta"),
    "https://example.com/note-1",
  );
  await user.type(screen.getByLabelText("Título do produto"), "Notebook X");
  await user.type(screen.getByLabelText("Preço desejado"), "3.499,90");
  await user.click(
    screen.getByRole("button", { name: /começar monitoramento/i }),
  );

  await vi.waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: "NOTE-1",
        targetPrice: 3499.9,
        currency: "BRL",
      }),
    ),
  );
});

it("mostra erro para preço inválido", async () => {
  const user = userEvent.setup();
  render(<ProductForm onSubmit={vi.fn()} />);
  await user.type(screen.getByLabelText("Preço desejado"), "0");
  await user.click(
    screen.getByRole("button", { name: /começar monitoramento/i }),
  );
  expect(
    await screen.findByText("Informe um preço maior que zero."),
  ).toBeVisible();
});
