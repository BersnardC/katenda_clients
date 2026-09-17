// Cliente fetch del storefront. Todas las llamadas son server-side
// (Server Components / generateMetadata) con ISR revalidation por URL.
// La invalidación push viene del backend vía webhook (POST /api/revalidate).
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const DEFAULT_REVALIDATE = 86400; // 24h — invalidado por webhook desde Laravel

export async function apiFetch<T>(
  path: string,
  options?: { revalidate?: number; tag?: string },
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: {
      revalidate: options?.revalidate ?? DEFAULT_REVALIDATE,
      tags: options?.tag ? [options.tag] : undefined,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}
