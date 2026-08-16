import { useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { Paginated } from '@/types/pagination'

export type FilterStatus = 'all' | 'active' | 'inactive'

export interface HybridFilter {
  status: FilterStatus
  search: string
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}

export function useHybridFilter<T>({
  queryKey,
  queryFn,
  clientMatch,
  debounceMs = 400,
}: {
  queryKey: unknown[]
  queryFn: (
    params: { pageParam: number } & HybridFilter,
  ) => Promise<Paginated<T>>
  clientMatch: (item: T, filter: HybridFilter) => boolean
  debounceMs?: number
}) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<FilterStatus>('all')
  const [mode, setMode] = useState<'client' | 'server'>('client')
  const debouncedSearch = useDebouncedValue(q.trim(), debounceMs)

  const filterActive = q.trim() !== '' || status !== 'all'

  const params = useMemo<HybridFilter>(
    () =>
      mode === 'server'
        ? { status, search: debouncedSearch }
        : { status: 'all', search: '' },
    [mode, status, debouncedSearch],
  )

  const query = useInfiniteQuery({
    queryKey: [...queryKey, { filter: params }],
    queryFn: async ({ pageParam }) => queryFn({ pageParam, ...params }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  })

  const poolItems = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  )

  const clientFiltered = useMemo(
    () => poolItems.filter((it) => clientMatch(it, { status, search: q })),
    [poolItems, clientMatch, status, q],
  )

  useEffect(() => {
    if (mode === 'client') {
      if (filterActive && clientFiltered.length === 0 && query.isSuccess) {
        setMode('server')
      }
    } else if (!filterActive) {
      setMode('client')
    }
  }, [mode, filterActive, clientFiltered.length, query.isSuccess])

  const items = mode === 'server' ? poolItems : clientFiltered
  const total = query.data?.pages.at(-1)?.total
  const isSkeleton = query.isPending

  return {
    items,
    total,
    q,
    setQ,
    status,
    setStatus,
    hasMore: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isSkeleton,
  }
}
