import api from './api'
import type { Paginated } from '@/types/pagination'
import type { AccountUser } from '@/types/models'
import type { ListParams } from './storeService'

export type UserStatus = 'active' | 'inactive' | 'all'

export interface UserListParams extends ListParams {
  status?: UserStatus
  search?: string
}

export interface UserCreateData {
  name: string
  email: string
  password: string
  role_id: number
  send_invitation: boolean
}

export const userService = {
  index: (params?: UserListParams) =>
    api.get<{ users: Paginated<AccountUser> }>('/users', { params }),
  create: (data: UserCreateData) =>
    api.post<{ message: string }>('/users', data),
  updateRole: (uuid: string, role_id: number) =>
    api.put<{ message: string }>(`/users/${uuid}`, { role_id }),
  deactivate: (uuid: string) =>
    api.post<{ message: string }>(`/users/${uuid}/deactivate`),
  activate: (uuid: string) =>
    api.post<{ message: string }>(`/users/${uuid}/activate`),
  remove: (uuid: string) => api.delete<{ message: string }>(`/users/${uuid}`),
}
