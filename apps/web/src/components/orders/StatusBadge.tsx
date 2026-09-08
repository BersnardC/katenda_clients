import { useI18n, type Key } from "@/lib/i18n";
import { statusColor } from "@/lib/orders";
import type { OrderStatus } from "@/types/models";

const STATUS_KEYS: Record<OrderStatus, Key> = {
  pending: "orders.statusPending",
  confirmed: "orders.statusConfirmed",
  preparing: "orders.statusPreparing",
  shipped: "orders.statusShipped",
  delivered: "orders.statusDelivered",
  cancelled: "orders.statusCancelled",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const key = STATUS_KEYS[status as OrderStatus] ?? "orders.statusPending";
  const color = statusColor(status);
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: color + "33", color }}
    >
      {t(key)}
    </span>
  );
}
