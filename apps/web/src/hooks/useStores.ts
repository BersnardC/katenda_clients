import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeService, type StoreData } from "@/services/storeService";
import { toast } from "sonner";
import type { AxiosError } from "axios";

const STORES_KEY = ["stores"];

export function useStores() {
  return useQuery({
    queryKey: STORES_KEY,
    queryFn: async () => {
      const res = await storeService.list();
      return res.data.stores;
    },
  });
}

export function useStore(uuid: string) {
  return useQuery({
    queryKey: ["store", uuid],
    queryFn: async () => {
      const res = await storeService.show(uuid);
      return res.data.store;
    },
    enabled: !!uuid,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreData) => storeService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORES_KEY, refetchType: "all" });
      toast.success("Tienda creada correctamente");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al crear tienda";
      console.error("[useCreateStore]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useUpdateStore(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StoreData>) => storeService.update(uuid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORES_KEY, refetchType: "all" });
      qc.invalidateQueries({ queryKey: ["store", uuid], refetchType: "all" });
      toast.success("Tienda actualizada correctamente");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al actualizar tienda";
      console.error("[useUpdateStore]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useDeactivateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => storeService.destroy(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORES_KEY, refetchType: "all" });
      toast.success("Tienda desactivada");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al desactivar tienda";
      console.error("[useDeactivateStore]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}
