import api from './api'
import type { Paginated } from '@/types/pagination'
import type { Store, StoreData } from '@/types/models'

export interface ListParams {
  page?: number
  per_page?: number
}

export const storeService = {
  list: (params?: ListParams) =>
    api.get<{ stores: Paginated<Store> }>('/stores', { params }),
  show: (uuid: string) => api.get<{ store: Store }>(`/stores/${uuid}`),
  create: (data: StoreData) => api.post<{ store: Store }>('/stores', data),
  update: (uuid: string, data: Partial<StoreData>) =>
    api.put<{ store: Store }>(`/stores/${uuid}`, data),
  deactivate: (uuid: string) => api.post(`/stores/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/stores/${uuid}/activate`),
  destroy: (uuid: string) => api.delete(`/stores/${uuid}`),
}
