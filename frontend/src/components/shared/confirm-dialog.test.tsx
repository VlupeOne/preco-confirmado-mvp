import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Button } from "@/components/ui/button";

import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  it("confirma uma ação destrutiva", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        title="Remover produto?"
        description="Esta ação não poderá ser desfeita."
        confirmLabel="Remover"
        destructive
        onConfirm={onConfirm}
        trigger={<Button>Excluir</Button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    await user.click(await screen.findByRole("button", { name: "Remover" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
