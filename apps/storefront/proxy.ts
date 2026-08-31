import { NextRequest, NextResponse } from "next/server";

// Subdominios que no son tiendas (apps propias de Katenda).
const EXCLUDED_SUBDOMAINS = new Set(["www", "api", "app", "admin"]);

function resolveSlug(hostname: string): string | null {
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
  const { pathname, searchParams } = request.nextUrl;

  // Las rutas internas de la app (/s/...) nunca se reescriben de nuevo.
  if (pathname.startsWith("/s/")) return NextResponse.next();

  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1";

  // Dev: sin subdominio real → slug vía query param ?slug=
  if (isLocalhost) {
    const slug = searchParams.get("slug");
    if (slug && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/s/${encodeURIComponent(slug)}`;
      url.searchParams.delete("slug");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Prod: {slug}.katenda.com/p/... → /s/{slug}/p/...
  const slug = resolveSlug(hostname);
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/s/${encodeURIComponent(slug)}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
