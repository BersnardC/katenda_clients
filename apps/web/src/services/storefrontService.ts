import api from "./api";

export type StorefrontStore = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: number;
  media: { uuid: string; url: string; type: string; position: number }[];
  contacts: { uuid: string; type: string; value: string; label: string | null; is_primary: boolean }[];
};

export type StorefrontProduct = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  code: string | null;
  category_id: number | null;
  category: { id: number; name: string; slug: string } | null;
  media: { uuid: string; url: string; type: string; position: number }[];
  status: number;
};

export type StorefrontCategory = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  icon: string | null;
  children: StorefrontCategory[];
};

export const storefrontService = {
  store: (slug: string) =>
    api.get<{ store: StorefrontStore }>(`/s/${slug}`),
  products: (slug: string) =>
    api.get<{ products: StorefrontProduct[] }>(`/s/${slug}/products`),
  categories: (slug: string) =>
    api.get<{ categories: StorefrontCategory[] }>(`/s/${slug}/categories`),
};
