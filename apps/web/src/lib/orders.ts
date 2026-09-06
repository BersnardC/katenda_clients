// Catálogo de estados de pedido (mismo diseño Lovable pedidos.$id.tsx).
export const ORDER_STATUSES = [
  { value: "pendiente", color: "#F7B267" },
  { value: "confirmado", color: "#A0C4FF" },
  { value: "preparando", color: "#BDB2FF" },
  { value: "enviado", color: "#90E0EF" },
  { value: "entregado", color: "#7BD3A8" },
  { value: "cancelado", color: "#F4978E" },
] as const;

export const STATUS_FLOW = [
  "pendiente",
  "confirmado",
  "preparando",
  "enviado",
  "entregado",
] as const;

export type OrderStatusKey = (typeof ORDER_STATUSES)[number]["value"];

export const statusColor = (status: string): string =>
  ORDER_STATUSES.find((s) => s.value === status)?.color ?? "#F7B267";
