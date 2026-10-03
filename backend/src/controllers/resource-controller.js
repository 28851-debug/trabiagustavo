import { AppError } from "../errors/app-error.js";
import { parseId } from "../utils/normalize.js";

export function createResourceController({ service, schema }) {
  const input = (body) => {
    const result = schema.safeParse(body);
    if (!result.success) throw new AppError(400, "VALIDATION_ERROR", "Dados inválidos.", result.error.flatten());
    return result.data;
  };
  const id = (value) => {
    const parsed = parseId(value);
    if (!parsed) throw new AppError(400, "VALIDATION_ERROR", "Identificador inválido.");
    return parsed;
  };
  return {
    list: async (_req, res) => res.json(await service.list()),
    create: async (req, res) => res.status(201).json(await service.create(input(req.body))),
    update: async (req, res) => res.json(await service.update(id(req.params.id), input(req.body))),
    remove: async (req, res) => { await service.remove(id(req.params.id)); res.status(204).end(); },
  };
}
