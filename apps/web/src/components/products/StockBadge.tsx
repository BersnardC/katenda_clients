import { useI18n } from "@/lib/i18n";

export function StockBadge({ stock }: { stock: number }) {
  const { t } = useI18n();
  const label =
    stock === 0
      ? t("products.stockOut")
      : `${stock} ${t("products.stockUnits")}`;
  const cls =
    stock === 0
      ? "bg-destructive/15 text-destructive"
      : stock < 5
        ? "bg-warning/20 text-warning-foreground"
        : "bg-success/20 text-success-foreground";
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cls}`}
    >
      {label}
    </span>
  );
}
