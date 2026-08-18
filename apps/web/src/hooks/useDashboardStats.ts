import { useEffect, useMemo, useState } from "react";
import { useStores } from "@/hooks/useStores";
import { productService } from "@/services/productService";
import type { Store } from "@/types/models";

export function useDashboardStats() {
  const { data: storesData, loading: storesLoading } = useStores();
  const stores: Store[] = useMemo(() => storesData?.data ?? [], [storesData]);

  const [storeProducts, setStoreProducts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  useEffect(() => {
    if (stores.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStoreProducts({});
      return;
    }
    let active = true;
    setCountsLoading(true);
    Promise.all(
      stores.map(async (s) => {
        try {
          const res = await productService.indexByStore(s.uuid, {
            per_page: 1,
          });
          return { uuid: s.uuid, total: res.products.total };
        } catch {
          return { uuid: s.uuid, total: 0 };
        }
      }),
    ).then((results) => {
      if (!active) return;
      setStoreProducts(Object.fromEntries(results.map((r) => [r.uuid, r.total])));
      setCountsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [stores]);

  const totalProducts = Object.values(storeProducts).reduce(
    (acc, n) => acc + n,
    0,
  );
  const loading = storesLoading || countsLoading;

  return {
    stores,
    totalStores: storesData?.meta.total ?? stores.length,
    totalProducts,
    storeProducts,
    loading,
  };
}
