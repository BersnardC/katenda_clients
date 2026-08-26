import { api } from "@/lib/api";
import type { Paginated } from "@/types/pagination";
import type { User, UserData } from "@/types/models";
import type { ListParams } from "./storeService";

export type UserStatus = "active" | "inactive" | "all";

export interface UserListParams extends ListParams {
  status?: UserStatus;
  search?: string;
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

export const userService = {
  // GET /users -> { data, links, meta } (?status, ?search)
  index: (params?: UserListParams) =>
    api.get<Paginated<User>>(`/users${buildQuery(params)}`),
  // GET /users/{uuid} -> { data: User } (role_id/status del pivot)
  show: (uuid: string) => api.get<{ data: User }>(`/users/${uuid}`),
  // POST /users -> { data: User } 201 (create-or-invite)
  create: (data: UserData) => api.post<{ data: User }>("/users", data),
  // PUT /users/{uuid} -> { data: User } (solo cambia role_id)
  update: (uuid: string, data: { role_id: number }) =>
    api.put<{ data: User }>(`/users/${uuid}`, data),
  // POST /users/{uuid}/deactivate|activate -> { message } (403 owner/self)
  deactivate: (uuid: string) => api.post(`/users/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/users/${uuid}/activate`),
  // DELETE /users/{uuid} -> 204
  destroy: (uuid: string) => api.delete(`/users/${uuid}`),
};
