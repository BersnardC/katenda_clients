import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, type ProductData } from "@/services/productService";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export function useProducts(storeUuid: string) {
  return useQuery({
    queryKey: ["products", storeUuid],
    queryFn: async () => {
      const res = await productService.list(storeUuid);
      return res.data.products;
    },
    enabled: !!storeUuid,
  });
}

export function useCreateProduct(storeUuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductData) => productService.create(storeUuid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", storeUuid], refetchType: "all" });
      toast.success("Producto creado correctamente");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al crear producto";
      console.error("[useCreateProduct]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useUpdateProduct(storeUuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<ProductData> }) =>
      productService.update(storeUuid, uuid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", storeUuid], refetchType: "all" });
      toast.success("Producto actualizado correctamente");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al actualizar producto";
      console.error("[useUpdateProduct]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storeUuid, uuid }: { storeUuid: string; uuid: string }) =>
      productService.hardDelete(storeUuid, uuid),
    onSuccess: (_data, { storeUuid }) => {
      qc.invalidateQueries({ queryKey: ["products", storeUuid] });
      toast.success("Producto eliminado permanentemente");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al eliminar producto";
      console.error("[useDeleteProduct]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useDeactivateProduct(storeUuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => productService.destroy(storeUuid, uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", storeUuid], refetchType: "all" });
      toast.success("Producto desactivado");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al desactivar producto";
      console.error("[useDeactivateProduct]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}
