import { api } from "./api.js";
import { escapeHtml } from "./html.js";
import { confirmAction, setBusy, showToast } from "./ui.js";

export function setupRepairParts({ getRepair, refresh }) {
  const dialog = document.querySelector("#part-dialog"), form = document.querySelector("#part-form"), select = form.product_id;
  document.querySelector("#add-part").onclick = async () => { const data = await api.get("/products?pageSize=100&stockStatus=in"); select.innerHTML = data.items.map((product) => `<option value="${product.id}">${escapeHtml(product.name)} · ${escapeHtml(product.sku)} · ${product.quantity} un.</option>`).join(""); form.reset(); dialog.showModal(); };
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); const button = form.querySelector("button[type=submit]"); setBusy(button, true);
    try { await api.post(`/repairs/${getRepair().id}/parts`, { product_id: Number(select.value), quantity: Number(form.quantity.value) }); showToast("Peça adicionada com sucesso."); dialog.close(); await refresh(); } catch (error) { showToast(error.message, "error"); } finally { setBusy(button, false); }
  });
  document.querySelector("#parts-list").addEventListener("click", async (event) => { const button = event.target.closest("[data-return-part]"); if (button && confirmAction("Devolver esta peça ao estoque?")) { await api.delete(`/repairs/${getRepair().id}/parts/${button.dataset.returnPart}`); showToast("Peça devolvida ao estoque."); await refresh(); } });
}
