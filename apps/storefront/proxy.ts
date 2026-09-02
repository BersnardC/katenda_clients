import { NextRequest, NextResponse } from "next/server";

// Subdominios que no son tiendas (apps propias de Katenda).
const EXCLUDED_SUBDOMAINS = new Set(["www", "api", "app", "admin"]);

// Header/cookie usados para pasar el slug a las páginas (SSR y navegación SPA).
const SLUG_HEADER = "x-katenda-slug";
const SLUG_COOKIE = "katenda.slug";

function resolveSlugFromHost(hostname: string): string | null {
  const dotIndex = hostname.indexOf(".");
  if (dotIndex === -1) return null; // dominio sin subdominio (ej. katenda.com)
  const subdomain = hostname.slice(0, dotIndex);
  if (!subdomain || EXCLUDED_SUBDOMAINS.has(subdomain)) return null;
  return subdomain;
}

export function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  // Dev: slug vía query param ?slug= (no hay subdominio real en localhost).
  // Prod: slug del subdominio {slug}.katenda.com.
  const slug = isLocalhost
    ? request.nextUrl.searchParams.get("slug")
    : resolveSlugFromHost(hostname);

  if (!slug) return NextResponse.next();

  // Header: lo lee la página en el primer acceso (visitas directas/crawlers).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SLUG_HEADER, slug);

  // Cookie: la llevan las peticiones de navegación SPA del cliente (<Link>).
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(SLUG_COOKIE, slug, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 año
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
