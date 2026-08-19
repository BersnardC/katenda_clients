import { api } from "@/lib/api";
import type { Paginated } from "@/types/pagination";
import type { Category, CategoryData, Media } from "@/types/models";
import type { ListParams } from "./storeService";

export type CategoryStatus = "active" | "inactive" | "all";

export interface CategoryListParams extends ListParams {
  status?: CategoryStatus;
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

export const categoryService = {
  // GET /categories -> { data, links, meta } (?status=active|inactive|all, ?search=, ?addons=)
  index: (params?: CategoryListParams) =>
    api.get<Paginated<Category>>(`/categories${buildQuery(params)}`),
  // GET /categories/{uuid} -> { data: Category }
  show: (uuid: string, params?: Pick<CategoryListParams, "addons">) =>
    api.get<{ data: Category }>(`/categories/${uuid}${buildQuery(params)}`),
  // POST /categories -> { data: Category } 201
  create: (data: CategoryData) =>
    api.post<{ data: Category }>("/categories", data),
  // PUT /categories/{uuid} -> { data: Category }
  update: (uuid: string, data: Partial<CategoryData>) =>
    api.put<{ data: Category }>(`/categories/${uuid}`, data),
  // POST /categories/{uuid}/deactivate|activate -> { message }
  deactivate: (uuid: string) => api.post(`/categories/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/categories/${uuid}/activate`),
  // DELETE /categories/{uuid} -> 204
  destroy: (uuid: string) => api.delete(`/categories/${uuid}`),
  // POST /categories/{uuid}/media (multipart images[]) -> { media, category } 201
  uploadImage: (uuid: string, file: File) => {
    const fd = new FormData();
    fd.append("images[]", file);
    return api.post<{ media: Media[]; category: Category }>(
      `/categories/${uuid}/media`,
      fd,
    );
  },
  // DELETE /categories/{uuid}/media -> { category }
  removeImage: (uuid: string) =>
    api.delete<{ category: Category }>(`/categories/${uuid}/media`),
};
