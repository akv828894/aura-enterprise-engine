import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { compactCurrencyFormatter, numberFormatter } from "../utils/formatters";
import { MetricCard } from "./MetricCard";

const categoryColors = ["#2563eb", "#0f766e", "#f59e0b", "#dc2626", "#7c3aed", "#475569", "#16a34a", "#c2410c"];

export function AnalyticsDashboard({ analytics, loading }) {
  const kpis = analytics?.kpis || {};
  const restockPriority = analytics?.restockPriority || [];
  const valuationByCategory = analytics?.valuationByCategory || [];

  return (
    <section className="dashboard-grid" aria-label="Command center analytics">
      <MetricCard label="Total SKUs" value={kpis.totalSkus || 0} icon="skus" />
      <MetricCard label="Inventory Value" value={kpis.totalInventoryValue || 0} icon="value" tone="green" />
      <MetricCard label="Out of Stock" value={kpis.outOfStockItems || 0} icon="stockout" tone="red" />

      <article className="analytics-panel analytics-panel--wide">
        <div className="panel-heading">
          <div>
            <p>Risk Assessment</p>
            <h2>Restock Priority</h2>
          </div>
          {loading && <span className="status-pill">Updating</span>}
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={restockPriority} margin={{ top: 8, right: 20, left: 0, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="sku" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={58} />
              <YAxis tickFormatter={(value) => numberFormatter.format(value)} width={42} />
              <Tooltip formatter={(value) => [numberFormatter.format(value), "Units"]} />
              <Bar dataKey="stockQuantity" radius={[4, 4, 0, 0]} fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="analytics-panel">
        <div className="panel-heading">
          <div>
            <p>Portfolio Distribution</p>
            <h2>Valuation by Category</h2>
          </div>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={valuationByCategory}
                dataKey="totalValue"
                nameKey="category"
                innerRadius={60}
                outerRadius={96}
                paddingAngle={2}
              >
                {valuationByCategory.map((entry, index) => (
                  <Cell key={entry.category} fill={categoryColors[index % categoryColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [compactCurrencyFormatter.format(value), "Value"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="category-legend">
          {valuationByCategory.slice(0, 6).map((category, index) => (
            <span key={category.category}>
              <i style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
              {category.category}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
