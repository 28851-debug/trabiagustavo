import { AppError } from "../errors/app-error.js";

export function notFoundHandler(request, response) {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Recurso não encontrado.",
      details: { method: request.method, path: request.path },
    },
  });
}

export function errorHandler(error, _request, response, _next) {
  response.locals.logger?.error?.(error);

  if (response.headersSent) {
    return;
  }

  const known = error instanceof AppError;
  response.status(known ? error.status : 500).json({
    error: {
      code: known ? error.code : "INTERNAL_ERROR",
      message: known ? error.message : "Erro interno do servidor.",
      ...(known && error.details ? { details: error.details } : {}),
    },
  });
}
