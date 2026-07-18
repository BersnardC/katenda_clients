import { useQuery } from "@tanstack/react-query";
import { storefrontService } from "@/services/storefrontService";

export function useStorefront(slug: string) {
  return useQuery({
    queryKey: ["storefront", slug],
    queryFn: async () => {
      const [storeRes, productsRes, categoriesRes] = await Promise.all([
        storefrontService.store(slug),
        storefrontService.products(slug),
        storefrontService.categories(slug),
      ]);
      return {
        store: storeRes.data.store,
        products: productsRes.data.products,
        categories: categoriesRes.data.categories,
      };
    },
    enabled: !!slug,
  });
}
