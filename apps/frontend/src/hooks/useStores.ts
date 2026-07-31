import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storeService } from '@/services/storeService'
import type { ListParams } from '@/services/storeService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage } from '@/types/auth'
import type { StoreData } from '@/types/models'

export const storesKey = (params?: ListParams) =>
  ['stores', params ?? {}] as const

export function useStores(params?: ListParams, enabled = true) {
  return useQuery({
    queryKey: storesKey(params),
    queryFn: async () => {
      const res = await storeService.list(params)
      return res.data.stores
    },
    enabled,
  })
}

export function useStore(uuid: string) {
  return useQuery({
    queryKey: ['store', uuid],
    queryFn: async () => {
      const res = await storeService.show(uuid)
      return res.data.store
    },
    enabled: !!uuid,
  })
}

export function useCreateStore() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: StoreData) => storeService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success(t('stores.created'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('stores.createError'))
    },
  })
}

export function useUpdateStore(uuid: string) {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: Partial<StoreData>) => storeService.update(uuid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      qc.invalidateQueries({ queryKey: ['store', uuid] })
      toast.success(t('stores.updated'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('stores.updateError'))
    },
  })
}

export function useToggleStoreStatus() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: ({ uuid, activate }: { uuid: string; activate: boolean }) =>
      activate ? storeService.activate(uuid) : storeService.deactivate(uuid),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      qc.invalidateQueries({ queryKey: ['store', vars.uuid] })
      toast.success(
        vars.activate ? t('stores.activated') : t('stores.deactivated'),
      )
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('stores.statusError'))
    },
  })
}
