import { AppError } from "../errors/app-error.js";
import { normalizeUniqueName } from "../utils/normalize.js";

const map = (i) => ({ sku: normalizeUniqueName(i.sku).toUpperCase(), name: normalizeUniqueName(i.name), categoryId: i.category_id, brand: i.brand || null, compatibility: i.compatibility || null, costPriceCents: i.cost_price_cents, salePriceCents: i.sale_price_cents, minimumStock: i.minimum_stock, supplierId: i.supplier_id ?? null, notes: i.notes || null, ...(i.quantity === undefined ? {} : { quantity: i.quantity }) });
export function createProductService(repository) {
  const validateRefs = async (data) => { if (!(await repository.categoryExists(data.categoryId))) throw new AppError(404, "NOT_FOUND", "Categoria não encontrada."); if (data.supplierId && !(await repository.supplierExists(data.supplierId))) throw new AppError(404, "NOT_FOUND", "Fornecedor não encontrado."); };
  const requireProduct = async (id) => { const p = await repository.findById(id); if (!p) throw new AppError(404, "NOT_FOUND", "Produto não encontrado."); return p; };
  return {
    list: (q) => repository.list(q), detail: requireProduct,
    async create(input) { const data = map(input); await validateRefs(data); if (await repository.findBySku(data.sku)) throw new AppError(409, "DUPLICATE_SKU", "SKU já cadastrado."); const id = await repository.create(data); return repository.findById(id); },
    async update(id, input) { await requireProduct(id); const data = map(input); await validateRefs(data); const duplicate = await repository.findBySku(data.sku); if (duplicate && duplicate.id !== id) throw new AppError(409, "DUPLICATE_SKU", "SKU já cadastrado."); await repository.update(id, data); return repository.findById(id); },
    async archive(id) { await requireProduct(id); await repository.archive(id); },
  };
}
