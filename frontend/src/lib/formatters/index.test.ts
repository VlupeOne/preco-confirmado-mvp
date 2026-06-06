import {
  calculateSavings,
  formatDateTime,
  formatMoney,
  formatPercent,
} from "@/lib/formatters";

describe("formatters", () => {
  it("formata moeda e porcentagem em pt-BR", () => {
    expect(formatMoney(3499, "BRL")).toContain("3.499,00");
    expect(formatPercent(0.125)).toBe("12,5%");
  });

  it("calcula economia em reais e percentual", () => {
    expect(calculateSavings(4000, 3500)).toEqual({
      amount: 500,
      percentage: 0.125,
    });
  });

  it("nunca mostra valores inválidos", () => {
    expect(formatMoney(Number.NaN)).toBe("—");
    expect(formatDateTime("not-a-date")).toBe("—");
  });
});
