import { api } from "@/lib/api";
import type { Customer } from "@/types/models";
import type { Paginated } from "@/types/pagination";

export interface CustomerFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

const buildQuery = (filters: CustomerFilters = {}) => {
  const qs = new URLSearchParams();
  if (filters.page) qs.set("page", String(filters.page));
  if (filters.per_page) qs.set("per_page", String(filters.per_page));
  if (filters.search) qs.set("search", filters.search);
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const customerService = {
  // GET /customers -> { data, links, meta } (?search)
  index: (filters?: CustomerFilters) =>
    api.get<Paginated<Customer>>(`/customers${buildQuery(filters)}`),
  // GET /customers/{uuid} -> { data: Customer } (orders embebidos)
  show: (uuid: string) => api.get<{ data: Customer }>(`/customers/${uuid}`),
};
