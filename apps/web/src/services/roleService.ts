import { api } from "@/lib/api";
import type { Paginated } from "@/types/pagination";
import type { Role, RoleData } from "@/types/models";
import type { ListParams } from "./storeService";

export type RoleStatus = "active" | "inactive" | "all";

export interface RoleListParams extends ListParams {
  status?: RoleStatus;
  search?: string;
  addons?: string;
}

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

export const roleService = {
  // GET /account/roles -> { data, links, meta } (?status, ?search, ?addons=users_count)
  index: (params?: RoleListParams) =>
    api.get<Paginated<Role>>(`/account/roles${buildQuery(params)}`),
  // GET /account/roles/{uuid} -> { data: Role } (permissions + ?addons=users_count)
  show: (uuid: string, params?: { addons?: string }) =>
    api.get<{ data: Role }>(`/account/roles/${uuid}${buildQuery(params)}`),
  // POST /account/roles -> { data: Role } 201 (name + permission_ids opcional)
  create: (data: RoleData) => api.post<{ data: Role }>("/account/roles", data),
  // PUT /account/roles/{uuid} -> { data: Role } (name + permission_ids; [] limpia)
  update: (uuid: string, data: Partial<RoleData>) =>
    api.put<{ data: Role }>(`/account/roles/${uuid}`, data),
  // POST /account/roles/{uuid}/deactivate|activate -> { message }
  deactivate: (uuid: string) => api.post(`/account/roles/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/account/roles/${uuid}/activate`),
  // DELETE /account/roles/{uuid} -> 204 (403 default, 409 con usuarios)
  destroy: (uuid: string) => api.delete(`/account/roles/${uuid}`),
};
