import { api } from "@/lib/api";
import type { Paginated } from "@/types/pagination";
import type { Store, StoreData } from "@/types/models";

export interface ListParams {
  page?: number;
  per_page?: number;
  status?: "active" | "inactive" | "all";
  search?: string;
  addons?: string;
}

export const storeService = {
  // GET /stores -> { data, links, meta } (solo activas)
  list: (params?: ListParams) =>
    api.get<Paginated<Store>>(`/stores${buildQuery(params)}`),
  // GET /stores/{uuid} -> { data: Store }
  show: (uuid: string) => api.get<{ data: Store }>(`/stores/${uuid}`),
  // POST /stores -> { data: Store } 201
  create: (data: StoreData) => api.post<{ data: Store }>("/stores", data),
  // PUT /stores/{uuid} -> { data: Store }
  update: (uuid: string, data: Partial<StoreData>) =>
    api.put<{ data: Store }>(`/stores/${uuid}`, data),
  // POST /stores/{uuid}/deactivate|activate -> { message }
  deactivate: (uuid: string) => api.post(`/stores/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/stores/${uuid}/activate`),
  // DELETE /stores/{uuid} -> 204
  destroy: (uuid: string) => api.delete(`/stores/${uuid}`),
};

function buildQuery(params?: object): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}
