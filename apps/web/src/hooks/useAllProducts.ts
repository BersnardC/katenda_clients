import { useQueries } from "@tanstack/react-query";
import { productService, type Product } from "@/services/productService";
import { useStores } from "@/hooks/useStores";
import type { Store } from "@/services/storeService";

export type ProductWithStore = Product & {
  store_name: string;
  store_uuid: string;
};

export function useAllProducts() {
  const { data: stores, isLoading: loadingStores } = useStores();

  const queries = useQueries({
    queries: (stores ?? []).map((store) => ({
      queryKey: ["products", store.uuid],
      queryFn: async () => {
        const res = await productService.list(store.uuid);
        return res.data.products.map((p) => ({
          ...p,
          store_name: store.name,
          store_uuid: store.uuid,
        })) as ProductWithStore[];
      },
      enabled: !!stores,
    })),
  });

  const isLoading = loadingStores || queries.some((q) => q.isLoading);
  const products = queries.flatMap((q) => q.data ?? []);

  return { data: products, isLoading, stores };
}
