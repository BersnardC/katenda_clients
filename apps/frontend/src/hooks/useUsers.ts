import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { userService } from '@/services/userService'
import type { UserStatus } from '@/services/userService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage } from '@/types/auth'
import type { AccountUser } from '@/types/models'
import { useHybridFilter } from './useHybridFilter'

export const USERS_PAGE_SIZE = 50

export function useInfiniteUsers(status: UserStatus = 'all') {
  return useInfiniteQuery({
    queryKey: ['users', { status }],
    queryFn: async ({ pageParam }) => {
      const res = await userService.index({
        page: pageParam,
        per_page: USERS_PAGE_SIZE,
        status,
      })
      return res.data.users
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  })
}

export function useUsersCount() {
  return useQuery({
    queryKey: ['users', 'count'],
    queryFn: async () => {
      const res = await userService.index({ status: 'all', per_page: 1 })
      return res.data.users.total
    },
  })
}

export function useHybridUsers() {
  return useHybridFilter<AccountUser>({
    queryKey: ['users'],
    queryFn: async ({ pageParam, status, search }) => {
      const res = await userService.index({
        page: pageParam,
        per_page: USERS_PAGE_SIZE,
        status,
        search: search || undefined,
      })
      return res.data.users
    },
    clientMatch: (u, filter) => {
      const term = filter.search.trim().toLowerCase()
      const matchText =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      const matchStatus =
        filter.status === 'all' ||
        (filter.status === 'active'
          ? u.pivot.status === 1
          : u.pivot.status === 0)
      return matchText && matchStatus
    },
  })
}

export function useAccountUser(uuid: string) {
  return useQuery({
    queryKey: ['users', 'by-uuid', uuid],
    queryFn: async () => {
      const res = await userService.index({ status: 'all', per_page: 100 })
      return res.data.users.data.find((u) => u.uuid === uuid) ?? null
    },
    enabled: !!uuid,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: {
      name: string
      email: string
      password: string
      role_id: number
      send_invitation: boolean
    }) => userService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('users.created'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('users.createError'))
    },
  })
}

export function useUpdateUserRole(uuid: string) {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (role_id: number) => userService.updateRole(uuid, role_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['users', 'by-uuid', uuid] })
      toast.success(t('users.updated'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('users.updateError'))
    },
  })
}

export function useToggleUserStatus() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: ({ uuid, activate }: { uuid: string; activate: boolean }) =>
      activate ? userService.activate(uuid) : userService.deactivate(uuid),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['users', 'by-uuid', vars.uuid] })
      toast.success(
        vars.activate ? t('users.activated') : t('users.deactivated'),
      )
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('users.statusError'))
    },
  })
}

export function useRemoveUser() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (uuid: string) => userService.remove(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('users.deleted'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('users.deleteError'))
    },
  })
}
