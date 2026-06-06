import { ApiError, parseProblemDetail } from "@/lib/api/problem-details";

type ApiResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

export function requireData<T>(result: ApiResult<T>): T {
  if (!result.response.ok || result.error !== undefined) {
    throw new ApiError(
      parseProblemDetail(result.error, result.response.status),
    );
  }
  if (result.data === undefined) {
    throw new ApiError({
      message: "O backend retornou uma resposta vazia inesperada.",
      status: result.response.status,
      violations: [],
    });
  }
  return result.data;
}

export function requireSuccess(result: ApiResult<unknown>) {
  if (!result.response.ok || result.error !== undefined) {
    throw new ApiError(
      parseProblemDetail(result.error, result.response.status),
    );
  }
}
