import { render, screen } from "@testing-library/react";

import { VerificationCard } from "@/features/products/product-detail";
import type { Verification } from "@/lib/api/types";

const base: Verification = {
  id: "v1",
  firstSnapshotId: "s1",
  secondSnapshotId: "s2",
  startedAt: "2026-06-06T10:00:00Z",
  createdAt: "2026-06-06T10:00:00Z",
};

it("mostra verificação aprovada e critérios positivos", () => {
  render(
    <VerificationCard
      verification={{
        ...base,
        status: "APPROVED",
        score: 95,
        confidence: "HIGH",
        reasons: '["price_confirmed","stock_confirmed"]',
      }}
      snapshots={[]}
    />,
  );
  expect(screen.getByText("Aprovada")).toBeVisible();
  expect(screen.getByText("Preço confirmado nas duas consultas")).toBeVisible();
});

it("destaca o motivo principal de rejeição", () => {
  render(
    <VerificationCard
      verification={{
        ...base,
        status: "REJECTED",
        score: 65,
        confidence: "LOW",
        reasons: '["seller_missing_or_changed","alert_eligibility_failed"]',
      }}
      snapshots={[]}
    />,
  );
  expect(
    screen.getByText(/Principal motivo: Vendedor ausente ou alterado/),
  ).toBeVisible();
});
