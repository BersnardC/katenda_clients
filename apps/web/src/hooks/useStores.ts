import { useFetch } from "@/hooks/useFetch";
import { storeService, type ListParams } from "@/services/storeService";

export function useStores(params?: ListParams) {
  return useFetch(() => storeService.list(params));
}

export function useStore(uuid: string) {
  return useFetch(() => storeService.show(uuid));
}
