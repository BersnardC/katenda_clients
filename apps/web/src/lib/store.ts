// Prefijo de la URL pública de la tienda (mismo copy del diseño Lovable).
export const STORE_URL_PREFIX = "katenda.app/store/";

// URL pública de la tienda vía subdominio: {protocol}://{slug}.base
const raw = import.meta.env.VITE_STOREFRONT_BASE_URL || "https://katenda.com";
const protocol = raw.startsWith("https") ? "https" : "http";
const storefrontBase = raw.replace(/^https?:\/\//, "").replace(/\/+$/, "");
export const STORE_PUBLIC_URL = (slug: string) => `${protocol}://${slug}.${storefrontBase}`;

// Color de acento temporal: accent_color no existe aún en la API (Fase 2/migración).
// Primer preset del diseño (accentPresets[0]).
export const ACCENT_FALLBACK = "#12B886";

// Presets de color de acento (mismo listado del diseño Lovable store-settings.tsx).
export const ACCENT_PRESETS = [
  "#12B886",
  "#F76707",
  "#E8590C",
  "#4C6EF5",
  "#7950F2",
  "#E64980",
  "#1098AD",
  "#F59F00",
];
