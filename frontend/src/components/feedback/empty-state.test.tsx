import { render, screen } from "@testing-library/react";

import { EmptyState } from "@/components/feedback/empty-state";

it("explica o estado vazio", () => {
  render(
    <EmptyState
      title="Nenhum produto"
      description="Cadastre sua primeira meta."
    />,
  );
  expect(screen.getByRole("heading", { name: "Nenhum produto" })).toBeVisible();
  expect(screen.getByText("Cadastre sua primeira meta.")).toBeVisible();
});
