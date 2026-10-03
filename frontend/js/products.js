import { api } from "./api.js";
import { formatCurrency } from "./formatters.js";
import { confirmAction, setBusy, showToast } from "./ui.js";
import { createCatalogItem } from "./catalog-admin.js";
import { setupInventory } from "./inventory.js";

const body = document.querySelector("#products-body"), form = document.querySelector("#product-form"), dialog = document.querySelector("#product-dialog"), search = document.querySelector("#search"), categoryFilter = document.querySelector("#category-filter"), stockFilter = document.querySelector("#stock-filter");
let categories = [], suppliers = [], products = [];
const initialSearch = new URLSearchParams(location.search).get("search");
if (initialSearch) search.value = initialSearch;
const toCents = (value) => Math.round(Number(String(value).replace(/\./g, "").replace(",", ".")) * 100);
const toDecimal = (value) => (value / 100).toFixed(2).replace(".", ",");

async function loadCatalog() {
  [categories, suppliers] = await Promise.all([api.get("/categories"), api.get("/suppliers")]);
  categoryFilter.innerHTML = '<option value="">Todas as categorias</option>' + categories.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  form.category_id.innerHTML = categories.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  form.supplier_id.innerHTML = '<option value="">Sem fornecedor</option>' + suppliers.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
}

export async function loadProducts() {
  const query = new URLSearchParams();
  if (search.value) query.set("search", search.value);
  if (categoryFilter.value) query.set("categoryId", categoryFilter.value);
  if (stockFilter.value) query.set("stockStatus", stockFilter.value);
  const data = await api.get(`/products?${query}`); products = data.items;
  body.innerHTML = products.map((product) => {
    const status = product.quantity === 0 ? "Esgotado" : product.quantity <= product.minimum_stock ? "Baixo" : "Normal";
    const encoded = JSON.stringify(product).replace(/'/g, "&#39;");
    return `<tr><td><strong>${product.name}</strong><small>${product.brand || "Sem marca"}</small></td><td>${product.sku}</td><td>${product.category_name}</td><td>${product.compatibility || "—"}</td><td>${formatCurrency(product.sale_price_cents)}</td><td><strong>${product.quantity}</strong></td><td><span class="badge ${status.toLowerCase()}">${status}</span></td><td class="actions"><button data-stock="add" data-product='${encoded}'>Entrada</button><button data-stock="remove" data-product='${encoded}'>Saída</button><button data-stock="adjust" data-product='${encoded}'>Ajustar</button><button data-history="${product.id}">Histórico</button><button data-edit="${product.id}">Editar</button><button class="danger" data-delete="${product.id}">Excluir</button></td></tr>`;
  }).join("");
  document.querySelector("#empty").hidden = products.length > 0;
}

function openProduct(product) {
  form.reset(); form.id.value = product?.id || ""; form.sku.value = product?.sku || ""; form.name.value = product?.name || ""; form.category_id.value = product?.category_id || categories[0]?.id || ""; form.supplier_id.value = product?.supplier_id || ""; form.brand.value = product?.brand || ""; form.compatibility.value = product?.compatibility || ""; form.cost_price.value = product ? toDecimal(product.cost_price_cents) : "0,00"; form.sale_price.value = product ? toDecimal(product.sale_price_cents) : "0,00"; form.quantity.value = product?.quantity || 0; form.quantity.disabled = Boolean(product); form.minimum_stock.value = product?.minimum_stock || 0; form.notes.value = product?.notes || ""; dialog.showModal();
}

document.querySelector("#new-product").onclick = () => openProduct();
document.querySelectorAll("dialog .close").forEach((button) => button.onclick = () => button.closest("dialog").close());
[search, categoryFilter, stockFilter].forEach((element) => element.addEventListener(element === search ? "input" : "change", loadProducts));
document.querySelector("#new-category").onclick = async () => { if (await createCatalogItem("categories")) { await loadCatalog(); await loadProducts(); } };
document.querySelector("#new-supplier").onclick = async () => { if (await createCatalogItem("suppliers")) await loadCatalog(); };
document.addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit]"); if (edit) openProduct(products.find((item) => item.id === Number(edit.dataset.edit)));
  const remove = event.target.closest("[data-delete]"); if (remove && confirmAction("Excluir este produto? Esta ação arquivará o registro.")) { await api.delete(`/products/${remove.dataset.delete}`); showToast("Produto removido com sucesso."); await loadProducts(); }
});
form.addEventListener("submit", async (event) => {
  event.preventDefault(); const submit = form.querySelector("button[type=submit]"); setBusy(submit, true);
  const data = { sku: form.sku.value, name: form.name.value, category_id: Number(form.category_id.value), supplier_id: form.supplier_id.value ? Number(form.supplier_id.value) : null, brand: form.brand.value || null, compatibility: form.compatibility.value || null, cost_price_cents: toCents(form.cost_price.value), sale_price_cents: toCents(form.sale_price.value), minimum_stock: Number(form.minimum_stock.value), notes: form.notes.value || null };
  try { if (form.id.value) await api.put(`/products/${form.id.value}`, data); else await api.post("/products", { ...data, quantity: Number(form.quantity.value) }); showToast("Produto salvo com sucesso."); dialog.close(); await loadProducts(); }
  catch (error) { showToast(error.message, "error"); } finally { setBusy(submit, false); }
});
setupInventory({ reload: loadProducts });
await loadCatalog(); await loadProducts();
