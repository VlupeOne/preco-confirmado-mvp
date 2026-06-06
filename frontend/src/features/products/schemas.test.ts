import {
  parseLocalizedMoney,
  productFormSchema,
} from "@/features/products/schemas";

describe("product form schema", () => {
  it("converte formatos monetários sem replace frágil", () => {
    expect(parseLocalizedMoney("R$ 3.499,90")).toBe(3499.9);
    expect(parseLocalizedMoney("3499.90")).toBe(3499.9);
  });

  it("rejeita preço não positivo e intervalo menor que cinco", () => {
    const result = productFormSchema.safeParse({
      providerCode: "MOCK",
      externalId: "X",
      sourceUrl: "https://example.com/x",
      title: "Produto",
      brand: "",
      model: "",
      color: "",
      storage: "",
      condition: "NEW",
      targetPrice: "0",
      currency: "BRL",
      checkIntervalMinutes: 4,
    });
    expect(result.success).toBe(false);
  });
});
