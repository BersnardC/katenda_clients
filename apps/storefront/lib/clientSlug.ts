"use client";

// Slug desde el navegador (cookie `katenda.slug` puesta por el proxy). Solo
// client-side. Devuelve null si aún no hay cookie (primer render de SPA no
// afectado — las páginas server ya resolvieron el slug).
export function getClientSlug(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("katenda.slug="));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split("=").slice(1).join("=")) || null;
  } catch {
    return null;
  }
}
