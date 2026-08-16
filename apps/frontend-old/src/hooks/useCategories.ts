import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'
import type { CategoryStatus } from '@/services/categoryService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage } from '@/types/auth'
import type { Category, CategoryData } from '@/types/models'
import { useHybridFilter } from './useHybridFilter'

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

export function useCategoriesCount() {
  return useQuery({
    queryKey: ['categories', 'count'],
    queryFn: async () => {
      const res = await categoryService.index({ status: 'all', per_page: 1 })
      return res.data.categories.total
    },
  })
}

export function useHybridCategories() {
  return useHybridFilter<Category>({
    queryKey: ['categories'],
    queryFn: async ({ pageParam, status, search }) => {
      const res = await categoryService.index({
        page: pageParam,
        per_page: CATEGORIES_PAGE_SIZE,
        status,
        search: search || undefined,
        addons: 'products_count',
      })
      return res.data.categories
    },
    clientMatch: (c, filter) => {
      const term = filter.search.trim().toLowerCase()
      const matchText =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term)
      const matchStatus =
        filter.status === 'all' ||
        (filter.status === 'active' ? c.status === 1 : c.status === 0)
      return matchText && matchStatus
    },
  })
}

export function useCategory(uuid: string) {
  return useQuery({
    queryKey: ['category', uuid],
    queryFn: async () => {
      const res = await categoryService.show(uuid, {
        addons: 'products_count',
      })
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
      categoryService.uploadImage(uuid, file),
    onSuccess: (data, vars) => {
      qc.setQueryData(['category', vars.uuid], data.data.category)
      patchCategoryImage(qc, vars.uuid, data.data.category.image_url)
      qc.invalidateQueries({ queryKey: ['media', 'categories', vars.uuid] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('media.addError'))
    },
  })
}

export function useRemoveCategoryImage() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (uuid: string) => categoryService.removeImage(uuid),
    onSuccess: (data, vars) => {
      qc.setQueryData(['category', vars], data.data.category)
      patchCategoryImage(qc, vars, null)
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(
        err.response?.data.message || t('categories.imageRemoveError'),
      )
    },
  })
}

function patchCategoryImage(
  qc: ReturnType<typeof useQueryClient>,
  uuid: string,
  imageUrl: string | null,
) {
  qc.setQueriesData({ queryKey: ['categories'] }, (old: unknown) => {
    if (!old || typeof old !== 'object' || !('pages' in old)) return old
    const infinite = old as {
      pages: { data: Category[]; [k: string]: unknown }[]
    }
    return {
      ...infinite,
      pages: infinite.pages.map((page) => ({
        ...page,
        data: page.data.map((c) =>
          c.uuid === uuid ? { ...c, image_url: imageUrl } : c,
        ),
      })),
    }
  })
}
