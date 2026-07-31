import api from './api'
import type { Paginated } from '@/types/pagination'
import type { Product, ProductData } from '@/types/models'
import type { ListParams } from './storeService'

export interface ProductListParams extends ListParams {
  store_uuid?: string
}

export const productService = {
  index: (params?: ProductListParams) =>
    api.get<{ products: Paginated<Product> }>('/products', { params }),
  indexByStore: (storeUuid: string, params?: ListParams) =>
    api.get<{ products: Paginated<Product> }>(`/stores/${storeUuid}/products`, {
      params,
    }),
  show: (uuid: string) => api.get<{ product: Product }>(`/products/${uuid}`),
  create: (data: ProductData) =>
    api.post<{ product: Product }>('/products', data),
  update: (uuid: string, data: Partial<ProductData>) =>
    api.put<{ product: Product }>(`/products/${uuid}`, data),
  deactivate: (uuid: string) => api.post(`/products/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/products/${uuid}/activate`),
  destroy: (uuid: string) => api.delete(`/products/${uuid}`),
}
