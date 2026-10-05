import { api } from "./api.js";
import { formatDate } from "./formatters.js";
import { escapeHtml } from "./html.js";
import { setBusy, showToast } from "./ui.js";
export function setupInventory({ reload }) {
  const dialog = document.querySelector("#stock-dialog"), form = document.querySelector("#stock-form"), preview = document.querySelector("#stock-preview");
  let product, mode;
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-stock]");
    if (button) {
      product = JSON.parse(button.dataset.product); mode = button.dataset.stock;
      dialog.querySelector("#stock-title").textContent = { add: "Entrada de estoque", remove: "Saída de estoque", adjust: "Ajuste de estoque" }[mode];
      dialog.querySelector("#current-stock").textContent = `Estoque atual: ${product.quantity}`;
      dialog.querySelector("#quantity-field").hidden = mode === "adjust";
      dialog.querySelector("#new-stock-field").hidden = mode !== "adjust";
      dialog.querySelector("#stock-submit").textContent = { add: "Confirmar entrada", remove: "Confirmar saída", adjust: "Confirmar ajuste" }[mode];
      form.reset(); preview.textContent = ""; dialog.showModal();
    }
    const history = event.target.closest("[data-history]");
    if (history) {
      const data = await api.get(`/products/${history.dataset.history}/movements`);
      document.querySelector("#history-list").innerHTML = data.items.map((item) => `<li><strong>${item.type} · ${item.quantity} un.</strong><span>${item.previous_stock} → ${item.new_stock} · ${escapeHtml(item.note || "Sem observação")} · ${formatDate(item.created_at)}</span></li>`).join("");
      document.querySelector("#history-dialog").showModal();
    }
  });
  form.addEventListener("input", () => { const quantity = Number(form.quantity.value || 0), next = Number(form.new_stock.value || 0); preview.textContent = mode === "add" ? `Novo estoque: ${product.quantity + quantity}` : mode === "remove" ? `Novo estoque: ${product.quantity - quantity}` : `Novo estoque: ${next}`; });
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); const submit = form.querySelector("button[type=submit]"); setBusy(submit, true);
    try { const body = mode === "adjust" ? { new_stock: Number(form.new_stock.value), reason: form.note.value } : { quantity: Number(form.quantity.value), note: form.note.value || null }; await api.post(`/products/${product.id}/stock/${mode}`, body); showToast("Estoque atualizado com sucesso."); dialog.close(); await reload(); }
    catch (error) { showToast(error.message, "error"); } finally { setBusy(submit, false); }
  });
}
