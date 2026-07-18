import api from "./api";

export type Category = {
  id: number;
  uuid: string;
  account_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  icon: string | null;
  image_url: string | null;
  status: number;
  created_at: string;
  updated_at: string;
};

export type CategoryData = {
  name: string;
  slug: string;
  parent_id?: number | null;
  icon?: string;
  image_url?: string;
};

export const categoryService = {
  list: () => api.get<{ categories: Category[] }>("/categories"),
  show: (uuid: string) => api.get<{ category: Category }>(`/categories/${uuid}`),
  create: (data: CategoryData) => api.post<{ category: Category }>("/categories", data),
  update: (uuid: string, data: Partial<CategoryData>) =>
    api.put<{ category: Category }>(`/categories/${uuid}`, data),
  destroy: (uuid: string) => api.delete(`/categories/${uuid}`),
};
