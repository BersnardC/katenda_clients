import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { roleService } from '@/services/roleService'
import type { RoleStatus } from '@/services/roleService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage } from '@/types/auth'
import type { Role, RoleData } from '@/types/models'
import { useHybridFilter } from './useHybridFilter'

export const ROLES_PAGE_SIZE = 50

export function useInfiniteRoles(status: RoleStatus = 'all') {
  return useInfiniteQuery({
    queryKey: ['roles', { status }],
    queryFn: async ({ pageParam }) => {
      const res = await roleService.index({
        page: pageParam,
        per_page: ROLES_PAGE_SIZE,
        status,
        addons: 'users_count',
      })
      return res.data.roles
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  })
}

export function useRolesCount() {
  return useQuery({
    queryKey: ['roles', 'count'],
    queryFn: async () => {
      const res = await roleService.index({ status: 'all', per_page: 1 })
      return res.data.roles.total
    },
  })
}

export function useHybridRoles() {
  return useHybridFilter<Role>({
    queryKey: ['roles'],
    queryFn: async ({ pageParam, status, search }) => {
      const res = await roleService.index({
        page: pageParam,
        per_page: ROLES_PAGE_SIZE,
        status,
        search: search || undefined,
        addons: 'users_count',
      })
      return res.data.roles
    },
    clientMatch: (r, filter) => {
      const term = filter.search.trim().toLowerCase()
      const matchText = !term || r.name.toLowerCase().includes(term)
      const matchStatus =
        filter.status === 'all' ||
        (filter.status === 'active' ? r.status === 1 : r.status === 0)
      return matchText && matchStatus
    },
  })
}

export function useRole(uuid: string) {
  return useQuery({
    queryKey: ['role', uuid],
    queryFn: async () => {
      const res = await roleService.show(uuid, { addons: 'users_count' })
      return res.data.role
    },
    enabled: !!uuid,
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await roleService.listPermissions()
      return res.data.permissions
    },
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: RoleData) => roleService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.success(t('roles.created'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('roles.createError'))
    },
  })
}

export function useUpdateRole(uuid: string) {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: Partial<RoleData>) => roleService.update(uuid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['role', uuid] })
      toast.success(t('roles.updated'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('roles.updateError'))
    },
  })
}

export function useSyncRolePermissions(uuid: string) {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (permission_ids: number[]) =>
      roleService.syncPermissions(uuid, permission_ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['role', uuid] })
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('roles.updated'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('roles.updateError'))
    },
  })
}

export function useToggleRoleStatus() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: ({ uuid, activate }: { uuid: string; activate: boolean }) =>
      activate ? roleService.activate(uuid) : roleService.deactivate(uuid),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['role', vars.uuid] })
      toast.success(
        vars.activate ? t('roles.activated') : t('roles.deactivated'),
      )
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('roles.statusError'))
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (uuid: string) => roleService.destroy(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.success(t('roles.deleted'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('roles.deleteError'))
    },
  })
}

export function isDefaultRole(role: Pick<Role, 'name'>): boolean {
  return (
    role.name === 'owner' || role.name === 'admin' || role.name === 'manager'
  )
}
