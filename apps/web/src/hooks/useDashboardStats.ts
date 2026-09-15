import type { Store } from "@/types/models";

export function useDashboardStats(stores: Store[], storesLoading: boolean) {
  return {
    stores,
    totalStores: stores.length,
    loading: storesLoading,
  };
}
