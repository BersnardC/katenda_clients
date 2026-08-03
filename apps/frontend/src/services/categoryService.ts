import api from './api'
import type { Paginated } from '@/types/pagination'
import type { Category, CategoryData } from '@/types/models'
import type { ListParams } from './storeService'

export type CategoryStatus = 'active' | 'inactive' | 'all'

export interface CategoryListParams extends ListParams {
  status?: CategoryStatus
}

export const categoryService = {
  index: (params?: CategoryListParams) =>
    api.get<{ categories: Paginated<Category> }>('/categories', { params }),
  show: (uuid: string) =>
    api.get<{ category: Category }>(`/categories/${uuid}`),
  create: (data: CategoryData) =>
    api.post<{ category: Category }>('/categories', data),
  update: (uuid: string, data: Partial<CategoryData>) =>
    api.put<{ category: Category }>(`/categories/${uuid}`, data),
  deactivate: (uuid: string) => api.post(`/categories/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/categories/${uuid}/activate`),
  destroy: (uuid: string) => api.delete(`/categories/${uuid}`),
}
