"use client";

// Catálogo "fresco" (client-side, sin caché): se usa para que el storefront
// refleje al instante cambios de precio/stock/estado publicados por el
// comercio, sin que el cliente recargue. Son los MISMOS endpoints públicos
// que ya consume el servidor (SSR), solo que con `cache: no-store`.

import { clientApi } from "@/lib/clientApi";
import type { Category, Product } from "@/types/models";
import type { RawPaginated } from "@/types/pagination";

export async function fetchFreshProducts(slug: string): Promise<Product[]> {
  const res = await clientApi.getFresh<{ products: RawPaginated<Product> }>(
    `/s/${slug}/products?per_page=50`,
  );
  return res.products?.data ?? [];
}

export async function fetchFreshCategories(slug: string): Promise<Category[]> {
  const res = await clientApi.getFresh<{ categories: Category[] }>(
    `/s/${slug}/categories`,
  );
  return res.categories ?? [];
}

// Devuelve null si el producto ya no está disponible (desactivado/eliminado)
// o falla la red: el caller conserva lo que ya tenía en pantalla.
export async function fetchFreshProduct(
  slug: string,
  uuid: string,
): Promise<Product | null> {
  try {
    const res = await clientApi.getFresh<{ product: Product }>(
      `/s/${slug}/products/${uuid}`,
    );
    return res.product ?? null;
  } catch {
    return null;
  }
}
