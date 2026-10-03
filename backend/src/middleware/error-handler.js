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

  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor.",
    },
  });
}
