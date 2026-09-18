// Utilidades de pedidos del cliente (colores de estado + derivación de pago).

import type { Key } from "@/lib/i18n";

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  payment_reported: "#f59e0b",
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
    case "payment_reported":
      return "order.status.payment_reported";
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

// El cliente puede pagar pedidos pendientes, con pago reportado, confirmados o en preparación.
export function isPayableOrder(
  orderStatus: string,
  paymentStatus?: string | null,
): boolean {
  const payable = ["pending", "payment_reported", "confirmed", "preparing"].includes(orderStatus);
  return payable && payState(paymentStatus) !== "approved";
}

// El cliente solo puede marcar como recibido un pedido que ya fue enviado.
export function canMarkReceived(status: string): boolean {
  return status === "shipped";
}

// La descarga/impresión del pedido está disponible desde que va en camino.
export function canDownloadOrder(status: string): boolean {
  return status === "shipped" || status === "delivered";
}

// Estados donde el pedido puede cambiar pronto (polling habilitado).
export function isPollableOrder(status: string): boolean {
  return ["pending", "payment_reported", "confirmed", "preparing"].includes(status);
}
