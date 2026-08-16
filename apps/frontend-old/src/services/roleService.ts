import api from './api'
import type { Paginated } from '@/types/pagination'
import type { Permission, Role, RoleData } from '@/types/models'
import type { ListParams } from './storeService'

export type RoleStatus = 'active' | 'inactive' | 'all'

export interface RoleListParams extends ListParams {
  status?: RoleStatus
  search?: string
  addons?: string
}

export const roleService = {
  index: (params?: RoleListParams) =>
    api.get<{ roles: Paginated<Role> }>('/account/roles', { params }),
  show: (uuid: string, params?: Pick<RoleListParams, 'addons'>) =>
    api.get<{ role: Role }>(`/account/roles/${uuid}`, { params }),
  create: (data: RoleData) => api.post<{ role: Role }>('/account/roles', data),
  update: (uuid: string, data: Partial<RoleData>) =>
    api.put<{ role: Role }>(`/account/roles/${uuid}`, data),
  syncPermissions: (uuid: string, permission_ids: number[]) =>
    api.put<{ role: Role }>(`/account/roles/${uuid}/permissions`, {
      permission_ids,
    }),
  deactivate: (uuid: string) => api.post(`/account/roles/${uuid}/deactivate`),
  activate: (uuid: string) => api.post(`/account/roles/${uuid}/activate`),
  destroy: (uuid: string) => api.delete(`/account/roles/${uuid}`),
  listPermissions: () => api.get<{ permissions: Permission[] }>('/permissions'),
}
