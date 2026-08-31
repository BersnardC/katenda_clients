// Cliente fetch del storefront. Todas las llamadas son server-side
// (Server Components / generateMetadata) con ISR `revalidate` para cachear
// por URL (protege además el throttle 60/min de la API pública).
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const DEFAULT_REVALIDATE = 60;

export async function apiFetch<T>(
  path: string,
  revalidate = DEFAULT_REVALIDATE,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}
