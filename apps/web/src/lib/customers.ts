// Catálogo visual de clientes (port fiel del diseño customers.index.tsx).
// El "tag" no se persiste: se deriva del nº real de pedidos.
export type CustomerTag = "nuevo" | "recurrente";

export const CUSTOMER_TAGS: Record<
  CustomerTag,
  { label: string; color: string }
> = {
  nuevo: { label: "Nuevo", color: "#A0C4FF" },
  recurrente: { label: "Recurrente", color: "#7BD3A8" },
};

export const segmentFor = (ordersCount: number): CustomerTag =>
  ordersCount >= 2 ? "recurrente" : "nuevo";

export const formatDate = (iso: string | null, locale?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale ?? "es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
