import { api } from "./api.js";
import { showToast } from "./ui.js";
export async function createCatalogItem(kind) {
  const label = kind === "categories" ? "categoria" : "fornecedor";
  const name = prompt(`Nome do ${label}:`);
  if (!name?.trim()) return false;
  try { await api.post(`/${kind}`, { name: name.trim() }); showToast(`${label} criado com sucesso.`); return true; }
  catch (error) { showToast(error.message, "error"); return false; }
}
