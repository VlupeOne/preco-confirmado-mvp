import { render, screen } from "@testing-library/react";

import { Navigation } from "@/components/layout/app-shell";

it("mostra administração apenas para ADMIN", () => {
  const { rerender } = render(
    <Navigation pathname="/dashboard" isAdmin={false} />,
  );
  expect(screen.queryByText("Demonstração")).not.toBeInTheDocument();

  rerender(<Navigation pathname="/dashboard" isAdmin />);
  expect(screen.getByText("Demonstração")).toBeVisible();
});
