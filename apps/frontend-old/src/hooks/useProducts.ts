import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { productService } from '@/services/productService'
import type { ProductListParams } from '@/services/productService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage } from '@/types/auth'
import type { ProductData } from '@/types/models'

export const PRODUCTS_PAGE_SIZE = 12

export function useInfiniteProducts(opts?: { storeUuid?: string }) {
  const params: ProductListParams = {
    page: undefined,
    per_page: PRODUCTS_PAGE_SIZE,
  }
  if (opts?.storeUuid) params.store_uuid = opts.storeUuid

  return useInfiniteQuery({
    queryKey: ['products', { storeUuid: opts?.storeUuid }],
    queryFn: async ({ pageParam }) => {
      const res = await productService.index({ ...params, page: pageParam })
      return res.data.products
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  })
}

export function useInfiniteProductsByStore(storeUuid?: string) {
  return useInfiniteQuery({
    queryKey: ['products', 'by-store', storeUuid],
    queryFn: async ({ pageParam }) => {
      const res = await productService.indexByStore(storeUuid!, {
        page: pageParam,
        per_page: PRODUCTS_PAGE_SIZE,
      })
      return res.data.products
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
    enabled: !!storeUuid,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  const { t } = useI18n()
  return useMutation({
    mutationFn: (data: ProductData) => productService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('products.created'))
    },
    onError: (err: AxiosError<ApiMessage>) => {
      toast.error(err.response?.data.message || t('products.createError'))
    },
  })
}
