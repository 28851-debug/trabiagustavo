import { AppError } from "../errors/app-error.js";
import { normalizeUniqueName } from "../utils/normalize.js";

export function createSupplierService(repository) {
  const requireFound = async (id) => {
    const item = await repository.findById(id);
    if (!item) throw new AppError(404, "NOT_FOUND", "Fornecedor não encontrado.");
    return item;
  };
  const clean = (input) => ({ ...input, name: normalizeUniqueName(input.name) });
  return {
    list: repository.list,
    async create(input) {
      const data = clean(input);
      if (await repository.findByName(data.name)) throw new AppError(409, "DUPLICATE_SUPPLIER", "Fornecedor já cadastrado.");
      return repository.create(data);
    },
    async update(id, input) {
      await requireFound(id);
      const data = clean(input);
      const duplicate = await repository.findByName(data.name);
      if (duplicate && duplicate.id !== id) throw new AppError(409, "DUPLICATE_SUPPLIER", "Fornecedor já cadastrado.");
      return repository.update(id, data);
    },
    async remove(id) {
      await requireFound(id);
      if (await repository.isUsed(id)) throw new AppError(409, "RESOURCE_IN_USE", "Fornecedor está em uso.");
      await repository.remove(id);
    },
  };
}
