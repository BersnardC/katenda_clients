import api from "./api";
import type { Media } from "./mediaService";

export type ProductData = {
  name: string;
  slug: string;
  description?: string;
  code?: string;
  stock?: number;
  price: number;
  category_id?: number | null;
};

export type Product = {
  id: number;
  uuid: string;
  store_id: number;
  name: string;
  slug: string;
  description: string | null;
  code: string | null;
  stock: number;
  price: string;
  category_id: number | null;
  status: number;
  media?: Media[];
  created_at: string;
  updated_at: string;
};

export const productService = {
  list: (storeUuid: string) =>
    api.get<{ products: Product[] }>(`/stores/${storeUuid}/products`),
  show: (storeUuid: string, uuid: string) =>
    api.get<{ product: Product }>(`/stores/${storeUuid}/products/${uuid}`),
  create: (storeUuid: string, data: ProductData) =>
    api.post<{ product: Product }>(`/stores/${storeUuid}/products`, data),
  update: (storeUuid: string, uuid: string, data: Partial<ProductData>) =>
    api.put<{ product: Product }>(`/stores/${storeUuid}/products/${uuid}`, data),
  destroy: (storeUuid: string, uuid: string) =>
    api.delete(`/stores/${storeUuid}/products/${uuid}`),
  hardDelete: (storeUuid: string, uuid: string) =>
    api.post(`/stores/${storeUuid}/products/${uuid}/delete`),
};
