import { apiFetch } from "./api";
import type { Category, Product, Storefront } from "@/types/models";
import type { RawPaginated } from "@/types/pagination";

export async function getStore(slug: string) {
  return apiFetch<Storefront>(`/s/${slug}`);
}

export async function getStoreProducts(slug: string) {
  return apiFetch<{ products: RawPaginated<Product> }>(
    `/s/${slug}/products?per_page=50`,
  );
}

export async function getStoreCategories(slug: string) {
  return apiFetch<{ categories: Category[] }>(`/s/${slug}/categories`);
}

export async function getProduct(slug: string, productUuid: string) {
  return apiFetch<{ product: Product }>(`/s/${slug}/products/${productUuid}`);
}

// Paginator vacío para fallbacks (products/categories no disponibles).
export function emptyPaginated<T>(): RawPaginated<T> {
  return {
    current_page: 1,
    data: [],
    first_page_url: null,
    from: null,
    last_page: 1,
    last_page_url: null,
    links: [],
    next_page_url: null,
    path: "",
    per_page: 50,
    prev_page_url: null,
    to: null,
    total: 0,
  };
}
