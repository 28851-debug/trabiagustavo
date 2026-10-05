import { api } from "./api.js";
import { escapeHtml } from "./html.js";
import { confirmAction, setBusy, showToast } from "./ui.js";

const body = document.querySelector("#customers-body"), search = document.querySelector("#customer-search"), dialog = document.querySelector("#customer-dialog"), form = document.querySelector("#customer-form");
let customers = [];
async function loadCustomers() {
  const query = new URLSearchParams({ pageSize: "100" }); if (search.value) query.set("search", search.value);
  const data = await api.get(`/customers?${query}`); customers = data.items;
  body.innerHTML = customers.map((customer) => `<tr><td><strong>${escapeHtml(customer.name)}</strong></td><td>${escapeHtml(customer.phone)}</td><td>${escapeHtml(customer.email || "—")}</td><td>${escapeHtml(customer.notes || "—")}</td><td class="actions"><button data-edit="${customer.id}">Editar</button><button class="danger" data-delete="${customer.id}">Excluir</button></td></tr>`).join("");
  document.querySelector("#customer-empty").hidden = customers.length > 0;
}
function openCustomer(customer) { form.reset(); form.id.value = customer?.id || ""; form.name.value = customer?.name || ""; form.phone.value = customer?.phone || ""; form.email.value = customer?.email || ""; form.notes.value = customer?.notes || ""; dialog.showModal(); }
document.querySelector("#new-customer").onclick = () => openCustomer();
document.querySelectorAll("dialog .close").forEach((button) => button.onclick = () => button.closest("dialog").close());
search.addEventListener("input", loadCustomers);
document.addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit]"); if (edit) openCustomer(customers.find((item) => item.id === Number(edit.dataset.edit)));
  const remove = event.target.closest("[data-delete]"); if (remove && confirmAction("Excluir este cliente?")) { try { await api.delete(`/customers/${remove.dataset.delete}`); showToast("Cliente excluído com sucesso."); await loadCustomers(); } catch (error) { showToast(error.message, "error"); } }
});
form.addEventListener("submit", async (event) => {
  event.preventDefault(); const submit = form.querySelector("button[type=submit]"); setBusy(submit, true); const data = { name: form.name.value, phone: form.phone.value, email: form.email.value || null, notes: form.notes.value || null };
  try { if (form.id.value) await api.put(`/customers/${form.id.value}`, data); else await api.post("/customers", data); showToast("Cliente salvo com sucesso."); dialog.close(); await loadCustomers(); } catch (error) { showToast(error.message, "error"); } finally { setBusy(submit, false); }
});
await loadCustomers();
