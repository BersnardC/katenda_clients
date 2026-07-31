import { useQueries } from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { useStores } from '@/hooks/useStores'

export function useDashboardStats() {
  const { data: storesData, isLoading: storesLoading } = useStores()
  const stores = storesData?.data ?? []

  const productTotals = useQueries({
    queries: stores.map((s) => ({
      queryKey: ['products', 'by-store', s.uuid],
      queryFn: async () => {
        const res = await productService.indexByStore(s.uuid, { per_page: 1 })
        return { storeUuid: s.uuid, total: res.data.products.total }
      },
    })),
  })

  const totalProducts = productTotals.reduce(
    (acc, q) => acc + (q.data?.total ?? 0),
    0,
  )
  const storeProducts = Object.fromEntries(
    productTotals
      .filter((q) => q.data)
      .map((q) => [q.data!.storeUuid, q.data!.total]),
  )
  const loading = storesLoading || productTotals.some((q) => q.isLoading)

  return {
    stores,
    totalStores: storesData?.total ?? stores.length,
    totalProducts,
    storeProducts,
    loading,
  }
}
