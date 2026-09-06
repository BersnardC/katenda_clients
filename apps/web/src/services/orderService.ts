import { api } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/models";
import type { Paginated } from "@/types/pagination";

export interface OrderFilters {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

const buildQuery = (filters: OrderFilters = {}) => {
  const qs = new URLSearchParams();
  if (filters.page) qs.set("page", String(filters.page));
  if (filters.per_page) qs.set("per_page", String(filters.per_page));
  if (filters.status && filters.status !== "all")
    qs.set("status", filters.status);
  if (filters.search) qs.set("search", filters.search);
  if (filters.from) qs.set("from", filters.from);
  if (filters.to) qs.set("to", filters.to);
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const orderService = {
  // GET /orders -> { data, links, meta }
  index: (filters?: OrderFilters) =>
    api.get<Paginated<Order>>(`/orders${buildQuery(filters)}`),
  // GET /orders/{uuid} -> { data: Order }
  show: (uuid: string) => api.get<{ data: Order }>(`/orders/${uuid}`),
  // PUT /orders/{uuid}/status -> { data: Order }
  updateStatus: (uuid: string, status: OrderStatus, note?: string) =>
    api.put<{ data: Order }>(`/orders/${uuid}/status`, { status, note }),
  // PUT /orders/{uuid}/note -> { data: Order }
  updateNote: (uuid: string, note: string) =>
    api.put<{ data: Order }>(`/orders/${uuid}/note`, { note }),
};
