import { render, screen } from "@testing-library/react";

import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { StatusBadge } from "@/components/shared/status-badge";

it("representa status com texto e ícone", () => {
  render(<StatusBadge status="APPROVED" />);
  expect(screen.getByText("Aprovada")).toBeInTheDocument();
  expect(document.querySelector("svg")).toBeInTheDocument();
});

it("mostra confiança e score", () => {
  render(<ConfidenceBadge confidence="HIGH" score={95} />);
  expect(screen.getByText(/Confiança Alta · 95\/100/)).toBeInTheDocument();
});
