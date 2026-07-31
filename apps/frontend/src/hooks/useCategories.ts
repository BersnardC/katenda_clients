import { useInfiniteQuery } from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'

export const CATEGORIES_PAGE_SIZE = 50

export function useInfiniteCategories() {
  return useInfiniteQuery({
    queryKey: ['categories'],
    queryFn: async ({ pageParam }) => {
      const res = await categoryService.index({
        page: pageParam,
        per_page: CATEGORIES_PAGE_SIZE,
      })
      return res.data.categories
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  })
}
