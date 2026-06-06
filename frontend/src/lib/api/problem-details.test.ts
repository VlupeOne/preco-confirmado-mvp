import { parseProblemDetail } from "@/lib/api/problem-details";

describe("parseProblemDetail", () => {
  it("prioriza violações de campo e preserva traceId", () => {
    const result = parseProblemDetail({
      title: "Dados inválidos",
      detail: "Revise os campos",
      status: 400,
      traceId: "trace-123",
      violations: [{ field: "email", message: "E-mail já cadastrado" }],
    });

    expect(result.message).toBe("E-mail já cadastrado");
    expect(result.traceId).toBe("trace-123");
  });

  it("não expõe HTML bruto como fallback", () => {
    expect(parseProblemDetail("<html>erro</html>", 500).message).toBe(
      "O serviço encontrou um erro inesperado.",
    );
  });
});
