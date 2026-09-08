// Catálogo de estados de pedido (mismo diseño Lovable pedidos.$id.tsx).
export const ORDER_STATUSES = [
  { value: "pending", color: "#F7B267" },
  { value: "confirmed", color: "#A0C4FF" },
  { value: "preparing", color: "#BDB2FF" },
  { value: "shipped", color: "#90E0EF" },
  { value: "delivered", color: "#7BD3A8" },
  { value: "cancelled", color: "#F4978E" },
] as const;

export const STATUS_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
] as const;

export type OrderStatusKey = (typeof ORDER_STATUSES)[number]["value"];

export const statusColor = (status: string): string =>
  ORDER_STATUSES.find((s) => s.value === status)?.color ?? "#F7B267";
