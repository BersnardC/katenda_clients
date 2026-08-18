import { api } from "@/lib/api";
import type { Paginated, RawPaginated } from "@/types/pagination";
import type { Product, ProductData } from "@/types/models";
import type { ListParams } from "./storeService";

export interface ProductListParams extends ListParams {
  store_uuid?: string;
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

export const productService = {
  // GET /products -> { data, links, meta } (solo activas, ?store_uuid)
  index: (params?: ProductListParams) =>
    api.get<Paginated<Product>>(`/products${buildQuery(params)}`),
  // GET /stores/{storeUuid}/products -> { products: RawPaginated<Product> } (paginator crudo, legacy)
  indexByStore: (storeUuid: string, params?: ListParams) =>
    api.get<{ products: RawPaginated<Product> }>(
      `/stores/${storeUuid}/products${buildQuery(params)}`,
    ),
  // GET /products/{uuid} -> { data: Product }
  show: (uuid: string) => api.get<{ data: Product }>(`/products/${uuid}`),
  // POST /products -> { data: Product } 201
  create: (data: ProductData) =>
    api.post<{ data: Product }>("/products", data),
  // PUT /products/{uuid} -> { data: Product }
  update: (uuid: string, data: Partial<ProductData>) =>
    api.put<{ data: Product }>(`/products/${uuid}`, data),
  deactivate: (uuid: string) => api.post(`/products/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/products/${uuid}/activate`),
  destroy: (uuid: string) => api.delete(`/products/${uuid}`),
};
