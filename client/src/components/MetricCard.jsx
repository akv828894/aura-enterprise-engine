import { ArrowDownRight, Boxes, DollarSign, PackageX } from "lucide-react";

import { compactCurrencyFormatter, numberFormatter } from "../utils/formatters";

const iconMap = {
  skus: Boxes,
  value: DollarSign,
  stockout: PackageX,
  risk: ArrowDownRight,
};

export function MetricCard({ label, value, tone = "neutral", icon = "skus" }) {
  const Icon = iconMap[icon] || Boxes;

  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <p>{label}</p>
        <strong>
          {typeof value === "number" && icon === "value"
            ? compactCurrencyFormatter.format(value)
            : typeof value === "number"
              ? numberFormatter.format(value)
              : value}
        </strong>
      </div>
    </article>
  );
}
