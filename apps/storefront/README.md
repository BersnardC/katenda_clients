# Katenda — Storefront público

SPA SSR (Next.js 16 + App Router) para las tiendas públicas de Katenda. Cada
tienda vive en su subdominio: `{slug}.katenda.com` → consume la API pública
`/s/{slug}`, `/s/{slug}/products`, `/s/{slug}/categories` y
`/s/{slug}/products/{uuid}`.

## Rutas

| URL | Ruta Next | Qué muestra |
|---|---|---|
| `{slug}.katenda.com` | `app/page.tsx` | Tienda (port fiel de `tienda.tsx`): banner/logo/acento, categorías, grid, carrito → WhatsApp |
| `{slug}.katenda.com/p/{uuid}` | `app/p/[productUuid]/page.tsx` | Producto (galería, cantidad, pedir por WhatsApp, relacionados) |

El `proxy.ts` (middleware) lee el subdominio y lo pasa a las páginas vía header
`x-katenda-slug` (primer acceso/crawlers) + cookie `katenda.slug` (navegación
SPA con `<Link>`). No hay reescrituras de ruta. En localhost se usa
`?slug=mi-tienda` en la raíz.

## Comandos

```bash
pnpm --filter storefront dev          # http://localhost:3000/?slug=mi-tienda
pnpm --filter storefront build
pnpm --filter storefront start        # producción (output standalone)
pnpm --filter storefront lint
pnpm --filter storefront check-types
```

## Env

`.env.local` → `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` (dev) /
`https://api.katenda.com` (prod).

## Notas

- **SSR + ISR**: los datos se cargan en el servidor con `revalidate` (60s);
  `generateMetadata` provee OG por tienda/producto. Carrito, buscador y filtro
  de categorías son client-side.
- **Imágenes**: `<img>` normal (la API ya entrega URLs optimizadas), sin
  `next/image`.
- **Auth de cliente**: pendiente (la API de clientes aún no existe) → sin
  login/registro. El carrito persiste en `localStorage` (`katenda.cart`).
- **i18n es/en** (`katenda.lang`) y **dark mode** (`katenda.theme`, default
  light), mismo patrón que `apps/web`.
- **`node-linker=hoisted`** en el `.npmrc` raíz del workspace: requisito para
  que `build:standalone` produzca un `dist-standalone/` portable (sin junctions
  al workspace). No revertir.
