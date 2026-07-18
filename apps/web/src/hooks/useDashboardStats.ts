import { useQuery } from "@tanstack/react-query";
import { storeService } from "@/services/storeService";
import { productService } from "@/services/productService";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const storesRes = await storeService.list();
      const stores = storesRes.data.stores;

      const productCounts = await Promise.all(
        stores.map(async (store) => {
          try {
            const res = await productService.list(store.uuid);
            return res.data.products.length;
          } catch {
            return 0;
          }
        }),
      );

      const totalProducts = productCounts.reduce((sum, c) => sum + c, 0);

      return {
        storeCount: stores.length,
        productCount: totalProducts,
      };
    },
    staleTime: 1000 * 60,
  });
}
