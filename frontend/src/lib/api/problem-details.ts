import { z } from "zod";

const violationSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const problemSchema = z.object({
  title: z.string().optional(),
  detail: z.string().optional(),
  status: z.number().optional(),
  traceId: z.string().nullish(),
  violations: z.array(violationSchema).optional(),
});

const statusMessages: Record<number, string> = {
  400: "Revise os dados informados.",
  401: "Sua sessão expirou. Entre novamente.",
  403: "Você não tem permissão para esta operação.",
  404: "O recurso solicitado não foi encontrado.",
  409: "Os dados foram alterados ou já existem.",
  422: "Não foi possível processar os dados.",
  429: "Muitas tentativas. Aguarde e tente novamente.",
  500: "O serviço encontrou um erro inesperado.",
  503: "O serviço está temporariamente indisponível.",
};

export type ParsedProblem = {
  message: string;
  status?: number;
  traceId?: string;
  violations: Array<{ field: string; message: string }>;
};

export function parseProblemDetail(
  input: unknown,
  fallbackStatus?: number,
): ParsedProblem {
  const parsed = problemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      message:
        (fallbackStatus ? statusMessages[fallbackStatus] : undefined) ??
        "Não foi possível concluir a operação.",
      status: fallbackStatus,
      violations: [],
    };
  }

  const problem = parsed.data;
  const violations = problem.violations ?? [];
  const message =
    violations[0]?.message ??
    problem.detail ??
    problem.title ??
    (problem.status && statusMessages[problem.status]) ??
    (fallbackStatus ? statusMessages[fallbackStatus] : undefined) ??
    "Não foi possível concluir a operação.";

  return {
    message,
    status: problem.status ?? fallbackStatus,
    traceId: problem.traceId ?? undefined,
    violations,
  };
}

export class ApiError extends Error {
  readonly problem: ParsedProblem;

  constructor(problem: ParsedProblem) {
    super(problem.message);
    this.name = "ApiError";
    this.problem = problem;
  }
}

export async function apiErrorFromResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("json")
    ? await response.json().catch(() => undefined)
    : undefined;
  return new ApiError(parseProblemDetail(body, response.status));
}
