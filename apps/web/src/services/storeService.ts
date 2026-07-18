import api from "./api";

export type StoreData = {
  name: string;
  slug: string;
  description?: string;
  domain?: string;
  logo_url?: string;
  banner_url?: string;
};

export type Store = {
  id: number;
  uuid: string;
  account_id: number;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: number;
  created_at: string;
  updated_at: string;
};

export const storeService = {
  list: () => api.get<{ stores: Store[] }>("/stores"),
  show: (uuid: string) => api.get<{ store: Store }>(`/stores/${uuid}`),
  create: (data: StoreData) => api.post<{ store: Store }>("/stores", data),
  update: (uuid: string, data: Partial<StoreData>) =>
    api.put<{ store: Store }>(`/stores/${uuid}`, data),
  destroy: (uuid: string) => api.delete(`/stores/${uuid}`),
};
