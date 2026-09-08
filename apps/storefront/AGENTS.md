<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Katenda Storefront — Agent Guide (SSR público)

> SPA público multi-tienda de Katenda. Cada tienda vive en su subdominio `{slug}.katenda.com`
> y consume la API pública (`api.katenda.com` → `/s/{slug}...`). Backend Laravel en
> `katenda_api` (guía: `katenda_api/AGENTS.md`, detalle: `katenda_api/_context/app-doc.md`).
> Diseño fuente: **`katenda-your-online-storefront` (Lovable)** — `src/routes/tienda.tsx`
> (tienda) y `src/routes/public-product.$id.tsx` (producto), port fiel.

## Quick commands

```bash
pnpm --filter storefront dev          # http://localhost:3000/?slug=owner001-store
pnpm --filter storefront build        # next build
pnpm --filter storefront build:standalone  # build + empaqueta standalone (static+public) en dist-standalone/
pnpm --filter storefront start        # producción local sobre el build
pnpm --filter storefront lint         # eslint . --max-warnings 0
pnpm --filter storefront check-types  # tsc --noEmit
```

- Env `.env.local`: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` (dev) / `https://api.katenda.com` (prod).
- Backend dev: `composer dev` en `katenda_api`. Seed: `owner@katenda.com` / `owner1234` → tienda `owner001 Store`.

## Flujo (cómo funciona la app)

```
{slug}.katenda.com/  o  /p/{uuid}
        │
        ▼
proxy.ts (middleware — en Next 16 la convención middleware.ts pasó a llamarse proxy.ts)
        ├─ lee el HOST → subdominio = slug (prod)
        ├─ inyecta header x-katenda-slug  (primer acceso / crawlers)
        ├─ setea cookie katenda.slug      (navegación SPA con <Link>)
        └─ NO reescribe rutas
        │
        ▼
app/page.tsx  o  app/p/[productUuid]/page.tsx   (Server Components)
        ├─ lib/slug.ts → requireSlug() (headers → searchParams → cookies)
        └─ services/storefrontService → fetch server con ISR revalidate 60s
        │
        ▼
generateMetadata → OG por tienda/producto (previews WhatsApp/redes)
        ▼
Navegación SPA con <Link> (sin recargar); el RSC lleva la cookie → mismo slug
```

- **Dev localhost**: no hay subdominio → slug vía `?slug=` en la raíz (el proxy setea la cookie,
  así la navegación `<Link>` sigue funcionando).

## API pública (contrato)

| Endpoint | Respuesta |
|---|---|
| `GET /s/{slug}` | `{ store, account }` — store con `media`/`contacts`/`currency`/`currency_secondary`/`settings`; account con company data + `verified` + `country_info` |
| `GET /s/{slug}/products?per_page=N` | `{ products: RawPaginated<Product> }` — items con `media` + `category` |
| `GET /s/{slug}/categories` | `{ categories: Category[] }` |
| `GET /s/{slug}/products/{productUuid}` | `{ product }` — con `media` + `category` + `store` |

### Cliente y pedidos (auth customers)

El cliente es **global de Katenda** (`customers` + pivot `account_customer`), auth con guard Sanctum separado `customers`. Endpoints client-side vía `lib/clientApi.ts` (Bearer en `katenda.customer_token`):

| Endpoint | Uso |
|---|---|
| `POST /auth/customer/register` / `login` | → `{ customer, token }` (`lib/customerAuth.tsx`) |
| `POST /s/{slug}/orders` | **registrar pedido ANTES de abrir WhatsApp** (`{ items:[{product_uuid, qty}], note? }`) → 201 `{ order }`. Valida stock (422), enforce `orders_per_month` (403), NO descuenta stock (se descuenta al confirmar en el panel). `services/orderService.ts` |
| `GET /s/{slug}/orders/mine` | pedidos del cliente logueado en esa tienda (página `/account`) |

Stock: **solo se muestran productos con `stock > 0`**; el carrito (`lib/cart.tsx`) topea cada línea a su `stock`. Login obligatorio para pedir (sin sesión → `/account`).

Throttle **60/min por IP** → el ISR (`revalidate: 60`) cachea en el servidor y lo protege.
Solo devuelve stores/products/categories **activos**.

## Rutas

| URL | Archivo | Qué muestra |
|---|---|---|
| `{slug}.katenda.com` | `app/page.tsx` | Tienda (port fiel `tienda.tsx`): banner/logo/acento, Verificada, categorías, grid (solo stock>0), carrito→WhatsApp con **pedido registrado antes** |
| `{slug}.katenda.com/p/{uuid}` | `app/p/[productUuid]/page.tsx` | Producto (port fiel `public-product.$id.tsx`): galería, cantidad (topeada a stock), "Agotado", pedir por WhatsApp con registro previo, relacionados |
| `{slug}.katenda.com/account` | `app/account/page.tsx` | Cuenta del cliente global (login/registro + sus pedidos `orders/mine`). Port de `cuenta.tsx` (solo pedidos; perfil/pagos/reseñas → futuras fases) |
| 404 | `app/not-found.tsx` + `app/p/[productUuid]/not-found.tsx` | Amigables |

## Estructura de archivos

```
app/
  layout.tsx            # fonts, THEME_INIT_SCRIPT, Providers
  globals.css           # tokens oklch (igual a apps/web) + @source packages/ui
  page.tsx              # server: tienda (slug → fetch → StorefrontPage)
  p/[productUuid]/page.tsx  # server: producto (slug+uuid → ProductPage)
  account/page.tsx      # server: cuenta del cliente (slug → CustomerAccountPage)
  not-found.tsx         # 404 global (Tienda no encontrada)
  robots.ts
proxy.ts                # middleware: subdominio → header + cookie
components/
  providers.tsx         # ThemeProvider + I18nProvider + CustomerProvider + CartProvider + Toaster
  storefront/StorefrontPage.tsx   # client: tienda
  product/ProductPage.tsx         # client: producto
  account/CustomerAccountPage.tsx # client: cuenta del cliente
  NotFound.tsx          # 404 compartido (client)
services/
  api.ts                # fetch server + next:{revalidate} + NEXT_PUBLIC_API_URL
  storefrontService.ts  # getStore/getStoreProducts/getStoreCategories/getProduct/emptyPaginated
  orderService.ts       # createOrder (POST /s/{slug}/orders) / fetchMyOrders — client-side
lib/
  slug.ts               # resolveSlug / requireSlug (headers → searchParams → cookies)
  clientSlug.ts         # getClientSlug (cookie katenda.slug) — client-only
  clientApi.ts          # fetch client-side con Bearer del customer (register/orders)
  customerAuth.tsx      # CustomerProvider + login/register/logout/refresh (localStorage katenda.customer*)
  cart.tsx              # carrito client (localStorage "katenda.cart", topeado a stock)
  i18n.tsx              # dict es/en flat + useI18n (claves store.*, product.*, cuenta.*, order.*, notFound.*)
  theme.tsx             # dark mode, DEFAULT LIGHT
  whatsapp.ts           # renderWhatsappMessage / normalizeWhatsappSettings / whatsappLink
  format.ts             # fmtCurrency / fmtDate / fmtIsoDate
  store.ts              # ACCENT_FALLBACK (#12B886), STORE_URL_PREFIX
  utils.ts              # cn
types/
  models.ts             # Store, Product, Category, Storefront, Contact, Currency, Media...
  pagination.ts         # RawPaginated
next.config.ts          # output: "standalone"
scripts/build-standalone.mjs  # empaqueta dist-standalone/ (static + public)
```

## Directrices de código

1. **Server-first**: los datos se cargan en Server Components con `next: { revalidate: 60 }`
   (`services/api.ts`). Client-side solo carrito, buscador y filtro de categorías.
2. **Slug**: nunca hardcodear ni derivarlo del path en páginas; siempre `requireSlug()` en
   `app/page.tsx`, `app/p/[productUuid]/page.tsx` y `app/account/page.tsx`. En client components
   usar `getClientSlug()` (cookie), nunca `requireSlug` (server-only).
3. **Imágenes**: `<img>` normal (la API ya entrega URLs optimizadas/absolutas vía `Media::url`).
   **NO** `next/image` (exigiría `remotePatterns` y duplica optimización). Eslint ya lo permite.
4. **Diseño**: port fiel a `tienda.tsx` / `public-product.$id.tsx`. Data real gana; campos
   decorativos sin API → **omitir** (rating/reviews 🔒 pendiente; el cliente SÍ se autentica
   contra `customers` global: "Entrar / Mi cuenta" + `/account` + prefill del nombre).
5. **Acento dinámico**: `store.accent_color` con fallback `ACCENT_FALLBACK`; aplicar alpha como
   `accent + "26"` / `accent + "33"` en hex.
6. **Precios**: `fmtCurrency(Number(price), currency.code)`; línea secundaria con `currency_secondary`.
7. **WhatsApp + pedidos**: el pedido se registra ANTES de abrir `wa.me` (`services/orderService.ts` →
   `POST /s/{slug}/orders`, requiere customer logueado; si no → `/account`). Número del contact
   `type=whatsapp` en `store.contacts` (fallback `account.phone`); plantilla de `store.settings.whatsapp`.
8. **Stock**: solo se muestra producto con `stock > 0`; página directa con stock 0 → "Agotado"
   (deshabilitado); carrito topeado a `stock` (`lib/cart.tsx`).
9. **i18n**: todas las cadenas visibles vía `t("store.*" | "product.*" | "cuenta.*" | "order.*" | "notFound.*")`
   en `lib/i18n.tsx` (es/en). Default `es`.
10. **Tema**: default **light** (no sigue el esquema del SO); solo persiste lo guardado en `katenda.theme`.
11. **UI compartida**: deep imports `@katenda_clients/ui/*` (ej. `dynamic-icon`, `sonner`). **NO barrel**.
12. **Iconos**: `lucide-react` (0.575, misma versión que `packages/ui`); para iconos por nombre
    (categorías) usar `DynamicIcon` de `@katenda_clients/ui/dynamic-icon`.
13. **Orden de código** en cada archivo: imports (react → next → lucide → ui → lib → components → services → types) → declaraciones → funciones → JSX.
14. **Verificación** al cerrar: `pnpm --filter storefront check-types` | `lint` | `build` (+ smoke con `?slug=`).

## Deploy standalone (VPS Virtualix + CloudPanel/nginx, sin Docker)

> **Requisito**: el workspace usa `node-linker=hoisted` (`.npmrc` raíz) para que el
> standalone sea autocontenido. Con el virtual store de pnpm, los junctions apuntan al
> workspace y el deploy se rompe (`MODULE_NOT_FOUND`). No revertir ese ajuste.

1. `pnpm --filter storefront build:standalone` → genera `dist-standalone/` autocontenido
   (`.next/standalone` + `.next/static` + `public`, sin junctions).
2. Subir `dist-standalone/` al VPS (p.ej. `/opt/storefront`).
3. Supervisor ejecuta (desde `/opt/storefront`): `PORT=3000 HOSTNAME=127.0.0.1 node apps/storefront/server.js`.
   (Node ≥20.9. El entry es `server.js`, NO `index.js`.)
4. nginx reverse proxy: `proxy_pass http://127.0.0.1:3000;` + wildcard TLS `*.katenda.com`
   (Cloudflare DNS apunta el wildcard a la IP del VPS; cert wildcard en CloudPanel o proxy CF).
5. Env prod: `NEXT_PUBLIC_API_URL=https://api.katenda.com`.
6. Requiere media en almacenamiento persistente (S3) en prod — las URLs de media son absolutas (`Storage::url`).
