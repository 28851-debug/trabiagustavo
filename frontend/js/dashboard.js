import { api } from "./api.js";
import { formatCurrency, formatDate } from "./formatters.js";
import { escapeHtml } from "./html.js";

const cards = document.querySelector("#metrics"), activity = document.querySelector("#activity");

try {
  const data = await api.get("/dashboard");
  const values = [
    ["Produtos", data.total_products],
    ["Unidades", data.total_units],
    ["Custo", formatCurrency(data.inventory_cost_cents)],
    ["Venda potencial", formatCurrency(data.potential_retail_cents)],
    ["Estoque baixo", data.low_stock_count],
    ["Esgotados", data.out_of_stock_count],
    ["Reparos ativos", data.active_repairs],
  ];
  cards.innerHTML = values.map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`).join("");
  activity.innerHTML = data.recent_movements.length
    ? data.recent_movements.map((movement) => `<li><strong>${escapeHtml(movement.product_name)}</strong><span>${movement.type} · ${movement.quantity} un. · ${formatDate(movement.created_at)}</span></li>`).join("")
    : "<li>Nenhuma movimentação recente.</li>";
} catch (error) {
  cards.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
}
