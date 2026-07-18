import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService, type Media } from "@/services/mediaService";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export function useMedia(type: string, uuid: string) {
  return useQuery({
    queryKey: ["media", type, uuid],
    queryFn: async () => {
      const res = await mediaService.list(type, uuid);
      return res.data.media;
    },
    enabled: !!type && !!uuid,
  });
}

export function useAddMedia(type: string, uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) =>
      mediaService.create(type, uuid, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media", type, uuid] });
      toast.success("Imagen(es) añadida(s)");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Error al añadir imagen(es)");
    },
  });
}

export function useDeleteMedia(type: string, uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaUuid: string) => mediaService.destroy(type, uuid, mediaUuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media", type, uuid] });
      toast.success("Imagen eliminada");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Error al eliminar imagen");
    },
  });
}
