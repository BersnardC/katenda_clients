import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, type CategoryData } from "@/services/categoryService";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryService.list();
      return res.data.categories;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryData) => categoryService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"], refetchType: "all" });
      toast.success("Categoría creada");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al crear categoría";
      console.error("[useCreateCategory]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<CategoryData> }) =>
      categoryService.update(uuid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"], refetchType: "all" });
      toast.success("Categoría actualizada");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al actualizar categoría";
      console.error("[useUpdateCategory]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => categoryService.destroy(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"], refetchType: "all" });
      toast.success("Categoría eliminada");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al eliminar categoría";
      console.error("[useDeleteCategory]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}
