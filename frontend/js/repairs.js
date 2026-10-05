import { api } from "./api.js";
import { formatCurrency, formatDate } from "./formatters.js";
import { escapeHtml } from "./html.js";
import { setBusy, showToast } from "./ui.js";
import { setupRepairParts } from "./repair-parts.js";

const statuses = { RECEIVED: "Recebido", DIAGNOSIS: "Em diagnóstico", WAITING_APPROVAL: "Aguardando aprovação", WAITING_PART: "Aguardando peça", IN_REPAIR: "Em reparo", READY: "Pronto para retirada", DELIVERED: "Entregue", CANCELLED: "Cancelado" };
const body = document.querySelector("#repairs-body"), search = document.querySelector("#repair-search"), filter = document.querySelector("#status-filter"), dialog = document.querySelector("#repair-dialog"), form = document.querySelector("#repair-form"), detailDialog = document.querySelector("#repair-detail");
let customers = [], repairs = [], currentRepair = null;
const toCents = (value) => Math.round(Number(String(value).replace(/\./g, "").replace(",", ".")) * 100);
const toDecimal = (value) => (Number(value || 0) / 100).toFixed(2).replace(".", ",");
const statusOptions = (empty = false) => `${empty ? '<option value="">Todos os status</option>' : ""}${Object.entries(statuses).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;

async function loadReferenceData() {
  const data = await api.get("/customers?pageSize=100"); customers = data.items;
  form.customer_id.innerHTML = customers.map((customer) => `<option value="${customer.id}">${escapeHtml(customer.name)} · ${escapeHtml(customer.phone)}</option>`).join("");
  form.status.innerHTML = statusOptions(); filter.innerHTML = statusOptions(true);
}
async function loadRepairs() {
  const query = new URLSearchParams({ pageSize: "100" }); if (search.value) query.set("device", search.value); if (filter.value) query.set("status", filter.value);
  const data = await api.get(`/repairs?${query}`); repairs = data.items;
  body.innerHTML = repairs.map((repair) => `<tr><td><strong>#${repair.id}</strong></td><td>${escapeHtml(repair.customer_name)}</td><td><strong>${escapeHtml(repair.device)}</strong><small>${escapeHtml([repair.brand, repair.model].filter(Boolean).join(" · ") || "—")}</small></td><td>${formatDate(repair.entry_date)}</td><td>${formatCurrency(repair.price_cents)}</td><td><span class="badge status-${repair.status.toLowerCase()}">${statuses[repair.status]}</span></td><td class="actions"><button data-detail="${repair.id}">Detalhes</button></td></tr>`).join("");
  document.querySelector("#repair-empty").hidden = repairs.length > 0;
}
function openRepair(repair) {
  form.reset(); form.id.value = repair?.id || ""; form.customer_id.value = repair?.customer_id || customers[0]?.id || ""; form.status.value = repair?.status || "RECEIVED"; form.device.value = repair?.device || ""; form.brand.value = repair?.brand || ""; form.model.value = repair?.model || ""; form.color.value = repair?.color || ""; form.serial_number.value = repair?.serial_number || ""; form.technician.value = repair?.technician || ""; form.price.value = toDecimal(repair?.price_cents); form.cost.value = toDecimal(repair?.cost_cents); form.reported_problem.value = repair?.reported_problem || ""; form.diagnosis.value = repair?.diagnosis || ""; form.technician_notes.value = repair?.technician_notes || ""; dialog.showModal();
}
async function showDetail(id = currentRepair?.id) {
  currentRepair = await api.get(`/repairs/${id}`);
  document.querySelector("#detail-reference").textContent = `OS #${currentRepair.id} · ${statuses[currentRepair.status]}`;
  document.querySelector("#detail-title").textContent = `${currentRepair.device} · ${currentRepair.customer_name}`;
  document.querySelector("#detail-content").innerHTML = `<div><span>Problema relatado</span><strong>${escapeHtml(currentRepair.reported_problem)}</strong></div><div><span>Diagnóstico</span><strong>${escapeHtml(currentRepair.diagnosis || "Não informado")}</strong></div><div><span>Técnico</span><strong>${escapeHtml(currentRepair.technician || "Não definido")}</strong></div><div><span>Valor</span><strong>${formatCurrency(currentRepair.price_cents)}</strong></div>`;
  const parts = currentRepair.parts || [];
  document.querySelector("#parts-list").innerHTML = parts.length ? parts.map((part) => `<div class="part-row"><div><strong>${escapeHtml(part.product_name)}</strong><small>${escapeHtml(part.product_sku)} · ${part.quantity} un. · custo ${formatCurrency(part.unit_cost_cents * part.quantity)}</small></div><button class="danger" data-return-part="${part.id}">Devolver peça</button></div>`).join("") : '<p class="muted">Nenhuma peça vinculada.</p>';
  if (!detailDialog.open) detailDialog.showModal();
}
document.querySelector("#new-repair").onclick = () => openRepair();
document.querySelectorAll("dialog .close").forEach((button) => button.onclick = () => button.closest("dialog").close());
search.addEventListener("input", loadRepairs); filter.addEventListener("change", loadRepairs);
body.addEventListener("click", async (event) => { const button = event.target.closest("[data-detail]"); if (button) await showDetail(button.dataset.detail); });
document.querySelector("#edit-repair").onclick = () => { detailDialog.close(); openRepair(currentRepair); };
form.addEventListener("submit", async (event) => {
  event.preventDefault(); const button = form.querySelector("button[type=submit]"); setBusy(button, true);
  const data = { customer_id: Number(form.customer_id.value), device: form.device.value, brand: form.brand.value || null, model: form.model.value || null, color: form.color.value || null, serial_number: form.serial_number.value || null, reported_problem: form.reported_problem.value, diagnosis: form.diagnosis.value || null, technician: form.technician.value || null, technician_notes: form.technician_notes.value || null, price_cents: toCents(form.price.value), cost_cents: toCents(form.cost.value), status: form.status.value };
  try { if (form.id.value) await api.put(`/repairs/${form.id.value}`, data); else await api.post("/repairs", data); showToast("Ordem salva com sucesso."); dialog.close(); await loadRepairs(); } catch (error) { showToast(error.message, "error"); } finally { setBusy(button, false); }
});
setupRepairParts({ getRepair: () => currentRepair, refresh: showDetail });
await loadReferenceData(); await loadRepairs();
