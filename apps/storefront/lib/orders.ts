// Utilidades de pedidos del cliente (colores de estado + derivación de pago).

import type { Key } from "@/lib/i18n";

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export function orderStatusKey(status: string): Key {
  switch (status) {
    case "pending":
      return "order.status.pending";
    case "confirmed":
      return "order.status.confirmed";
    case "preparing":
      return "order.status.preparing";
    case "shipped":
      return "order.status.shipped";
    case "delivered":
      return "order.status.delivered";
    case "cancelled":
      return "order.status.cancelled";
    default:
      return "order.status.pending";
  }
}

// Estado de pago derivado del último `payment` del pedido.
export function payState(
  status?: string | null,
): "none" | "pending" | "approved" | "rejected" {
  if (!status) return "none";
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
}

// El diseño solo permite pagar pedidos confirmados/preparando que no estén
// ya verificados.
export function isPayableOrder(
  orderStatus: string,
  paymentStatus?: string | null,
): boolean {
  const payable = ["confirmed", "preparing"].includes(orderStatus);
  return payable && payState(paymentStatus) !== "approved";
}
