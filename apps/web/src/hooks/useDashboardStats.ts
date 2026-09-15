import { useMemo } from "react";
import type { Store } from "@/types/models";

export function useDashboardStats(stores: Store[], storesLoading: boolean) {
  const storeProducts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of stores) {
      map[s.uuid] = s.products_count ?? 0;
    }
    return map;
  }, [stores]);

  const totalProducts = useMemo(
    () => Object.values(storeProducts).reduce((acc, n) => acc + n, 0),
    [storeProducts],
  );

  return {
    stores,
    totalStores: stores.length,
    totalProducts,
    storeProducts,
    loading: storesLoading,
  };
}
