import { AppError } from "../errors/app-error.js";
import { normalizeUniqueName } from "../utils/normalize.js";

export function createCategoryService(repository) {
  const requireFound = async (id) => {
    const item = await repository.findById(id);
    if (!item) throw new AppError(404, "NOT_FOUND", "Categoria não encontrada.");
    return item;
  };
  return {
    list: repository.list,
    async create(input) {
      const name = normalizeUniqueName(input.name);
      if (await repository.findByName(name)) throw new AppError(409, "DUPLICATE_CATEGORY", "Categoria já cadastrada.");
      return repository.create({ name });
    },
    async update(id, input) {
      await requireFound(id);
      const name = normalizeUniqueName(input.name);
      const duplicate = await repository.findByName(name);
      if (duplicate && duplicate.id !== id) throw new AppError(409, "DUPLICATE_CATEGORY", "Categoria já cadastrada.");
      return repository.update(id, { name });
    },
    async remove(id) {
      await requireFound(id);
      if (await repository.isUsed(id)) throw new AppError(409, "RESOURCE_IN_USE", "Categoria está em uso.");
      await repository.remove(id);
    },
  };
}
