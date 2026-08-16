import api from "./api";

export type Media = {
  id: number;
  uuid: string;
  model_type: string;
  model_id: number;
  url: string;
  type: string;
  position: number;
  created_at: string;
};

export const mediaService = {
  list: (type: string, uuid: string) =>
    api.get<{ media: Media[] }>(`/${type}/${uuid}/media`),
  create: (type: string, uuid: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images[]", f));
    return api.post<{ media: Media[] }>(`/${type}/${uuid}/media`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  destroy: (type: string, uuid: string, mediaUuid: string) =>
    api.delete(`/${type}/${uuid}/media/${mediaUuid}`),
};
