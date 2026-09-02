import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

const SLUG_HEADER = "x-katenda-slug";
const SLUG_COOKIE = "katenda.slug";

// Resuelve el slug de la tienda desde la petición, en orden:
// 1. header inyectado por el proxy (primer acceso / crawlers)
// 2. query param ?slug= (dev localhost)
// 3. cookie persistida por el proxy (navegación SPA del cliente)
export async function resolveSlug(querySlug?: string | null): Promise<string | null> {
  const h = await headers();
  const headerSlug = h.get(SLUG_HEADER);
  if (headerSlug) return headerSlug;

  if (querySlug) return querySlug;

  const c = await cookies();
  const cookieSlug = c.get(SLUG_COOKIE)?.value;
  if (cookieSlug) return cookieSlug;

  return null;
}

// Igual que resolveSlug pero lanza notFound() si no hay slug.
export async function requireSlug(querySlug?: string | null): Promise<string> {
  const slug = await resolveSlug(querySlug);
  if (!slug) notFound();
  return slug;
}
