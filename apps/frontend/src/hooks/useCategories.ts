import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'
import type { CategoryStatus } from '@/services/categoryService'
import { mediaService } from '@/services/mediaService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage } from '@/types/auth'
import type { CategoryData } from '@/types/models'

export const CATEGORIES_PAGE_SIZE = 50

export function useInfiniteCategories(status: CategoryStatus = 'all') {
  return useInfiniteQuery({
    queryKey: ['categories', { status }],
    queryFn: async ({ pageParam }) => {
      const res = await categoryService.index({
        page: pageParam,
        per_page: CATEGORIES_PAGE_SIZE,
        status,
      })
      return res.data.categories
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  })
}

export function useActiveCategoriesCount() {
  return useQuery({
    queryKey: ['categories', 'count', 'active'],
    queryFn: async () => {
      const res = await categoryService.index({ status: 'active', per_page: 1 })
      return res.data.categories.total
    },
  })
}

export function useCategory(uuid: string) {
  return useQuery({
    queryKey: ['category', uuid],
    queryFn: async () => {
      const res = await categoryService.show(uuid)
      return res.data.category
    },
    enabled: !!uuid,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: CategoryData) => categoryService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('categories.created'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('categories.createError'))
    },
  })
}

export function useUpdateCategory(uuid: string) {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: Partial<CategoryData>) =>
      categoryService.update(uuid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['category', uuid] })
      toast.success(t('categories.updated'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('categories.updateError'))
    },
  })
}

export function useToggleCategoryStatus() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: ({ uuid, activate }: { uuid: string; activate: boolean }) =>
      activate
        ? categoryService.activate(uuid)
        : categoryService.deactivate(uuid),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['category', vars.uuid] })
      toast.success(
        vars.activate ? t('categories.activated') : t('categories.deactivated'),
      )
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('categories.statusError'))
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (uuid: string) => categoryService.destroy(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('categories.deleted'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('categories.deleteError'))
    },
  })
}

export function useUploadCategoryImage() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: ({ uuid, file }: { uuid: string; file: File }) =>
      mediaService.create('categories', uuid, [file]),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['media', 'categories', vars.uuid] })
      toast.success(t('media.added'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('media.addError'))
    },
  })
}

export function useSetCategoryImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, image_url }: { uuid: string; image_url: string }) =>
      categoryService.update(uuid, { image_url }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['category', vars.uuid] })
    },
  })
}
