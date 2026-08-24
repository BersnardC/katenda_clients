# Katenda Clients — Agent Guide (SPA web)

> Guía operativa para trabajar en el monorepo `katenda_clients`. El estándar de módulos vive aquí; los detalles de negocio/API en `katenda_api/AGENTS.md` y el roadmap en `ROADMAP.md` (raíz del workspace).

## Quick commands

```bash
pnpm --filter web dev          # dev server http://localhost:5173
pnpm --filter web build        # tsc -b + vite build (chunks por módulo)
pnpm --filter web lint         # eslint
pnpm --filter web check-types  # tsc -b --noEmit
```

- Stack: Vite + React 19 + TS + Tailwind v4, `@katenda_clients/ui` (deep imports, no barrel), fetch puro (`lib/api.ts`), react-router 7 lazy.
- `apps/frontend-old` es legacy — no tocar.
- `.env`: `VITE_API_BASE_URL=http://api.localhost:8000` (dev) / `https://api.katenda.com` (prod). Backend: `composer dev` en `katenda_api`.

---

## PATRÓN DE MÓDULO — El estándar es Categorías

> **Regla de oro:** todo módulo CRUD nuevo es una **copia estructural del módulo `categories`** — misma anatomía, mismo flujo, mismas validaciones, mismos componentes. Consistencia > inventiva.
>
> **Código canónico:** `src/pages/app/categories/*` + `src/components/categories/*`. Ante cualquier duda sobre el patrón, leer esos archivos.
>
> **Segundo módulo de referencia:** `src/pages/app/roles/*` + `src/components/roles/*` — mismo patrón, pero con el **detalle/edit fiel al diseño Lovable** (card hero compacta + stats con iconos + footer editar/eliminar; form con labels chicos arriba) y guard de roles default (Switch disabled, sin delete). Usarlo de referencia para módulos con reglas de negocio similares.

### Orden de código obligatorio en cada archivo

```
1. imports        (solo lo que se usa, orden: react, router, lucide, ui, lib, components, services, types)
2. declarations   (constantes, tipos helper, estados, hooks, useMemo)
3. functions      (load, loadMore, submit*, toggle, remove, helpers)
4. returns        (JSX, sin lógica — los handlers ya están arriba)
```

### Estructura de archivos por módulo `X`

```
src/pages/app/x/index.tsx          # listado + dialog crear
src/pages/app/x/detail.tsx         # vista detalle
src/pages/app/x/edit.tsx           # edición
src/components/x/XForm.tsx         # formulario compartido (create + edit)
src/components/x/XCard.tsx         # card del listado
src/components/x/XSkeleton.tsx     # skeleton de card
src/services/xService.ts           # fetch puro, envelopes reales
src/types/models.ts                # interfaces X y XData (+X)
src/lib/i18n.tsx                   # claves "x.*" en es y en
src/App.tsx                        # 3 rutas lazy: x, x/:uuid, x/:uuid/edit
```

### Anatomía de cada archivo

**`index.tsx`** (copy de `categories/index.tsx`):
- Header: back arrow → título + contador `{total} / {limit}` con `usePlanLimit("x")`.
- Search input + tabs de status (`all/active/inactive`), contador `cats.length/meta.total`.
- Lista `<ul>` de `XCard`; skeletons en loading; empty state con `t("common.empty")`.
- `ItemsPaginator` (PAGE_SIZE = 20, paginación **server** con `load`/`loadMore` y `meta`).
- FAB `+` fijo (abre Dialog crear; si `atMax` abre Dialog de límite).
- `Dialog` crear con `DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`.
- `Dialog` plan-limit con icono `Crown` (título/sub/ok).
- `ConfirmDeleteDialog` al final.
- Estados en orden: items, meta, loading, loadingMore, q, status, openCreate, openLimit, creating, form, toDelete. Constantes `PAGE_SIZE`, `emptyForm`, helper `errMsg`.
- Validación mínima cliente: nombre requerido → `toast.error`; límite → dialog.

**`detail.tsx`** (copy de `categories/detail.tsx`):
- `SkeletonView` en loading; estado notFound con link back.
- Header: back + título + botón editar (lápiz).
- Imagen o fallback; grid de `InfoTile` (label/value/accent); secciones relacionadas; botón eliminar → `ConfirmDeleteDialog` → `destroy` → navigate al index.

**`edit.tsx`** (copy de `categories/edit.tsx`):
- `SkeletonForm` en loading; notFound con link back.
- Carga `show` (con addons si aplica) → inicializa `form`; carga extras en paralelo (ej. lista de padres).
- `submit`: valida → `update` → si hay imagen nueva (`form.image.startsWith("data:")`) → `dataUrlToFile` → `uploadImage`; si se quitó → `removeImage` → `toast.success` → `navigate` al detalle.

**`XForm.tsx`**: componente **controlado** (`value`/`onChange`, patch con `set = (p) => onChange({...value, ...p})`); dropzone + input file oculto; campos con clase `inputCls`; switch de activo.

**`xService.ts`** (copy de `categoryService.ts`): `index` (Paginated + query params), `show`, `create`, `update`, `deactivate`, `activate`, `destroy` (204), `uploadImage`/`removeImage` (media). Helper local `buildQuery`. Envelopes reales: `{ data, links, meta }` / `{ data }` / 204 / `{ message }`.

**`types/models.ts`**: `X` (relaciones opcionales con `?`) + `XData` (payload de create/update con `status?: 0 | 1`).

**`lib/i18n.tsx`**: claves planas `"x.<clave>"` en **es y en** (dict flat), con los mismos nombres que categorías: title, new, edit, search, filterAll/Active/Inactive, notFound, newSub, created, updated, deleted, activated, deactivated, createError, updateError, deleteError, statusError, deleteTitle, deleteConfirm, labels, limitTitle/limitSub/limitOk, creating.

**`App.tsx`**: rutas lazy dentro del layout app:
```tsx
{ path: "x", lazy: () => import("./pages/app/x/index") },
{ path: "x/:uuid", lazy: () => import("./pages/app/x/detail") },
{ path: "x/:uuid/edit", lazy: () => import("./pages/app/x/edit") },
```

### Variante index-only (Usuarios)

> Cuando la API **no expone `show`** (ej. `GET /users/{uuid}` no existe), el módulo NO tiene `detail.tsx`/`edit.tsx`. Estructura:
> - `pages/app/users/index.tsx`: listado + **Dialog crear** + **Dialog editar** (rol/status) inline.
> - La edición usa `update` (cambiar rol) y `deactivate`/`activate` (status); 403/409 llegan del backend → `toast.error(errMsg(...))`.
> - Mismo resto del patrón: header `{total}/{limit}`, search + tabs, `ItemsPaginator`, FAB + Dialog límite (Crown), `ConfirmDeleteDialog`.

### Imágenes (si el módulo tiene media)
Exactamente como en categorías:
- `handleFile` async → `compressImage(file)` de `src/lib/image.ts` (≤1MB, máx 1600px, WebP con fallback, web worker) → `FileReader.readAsDataURL` → data-URL en estado (try/catch con fallback al original).
- Al guardar: `dataUrlToFile(form.image, "nombre.jpg")` (deriva extensión del MIME real) → `uploadImage(uuid, file)`; si se quitó → `removeImage`.
- No cambiar `image.ts` sin tocar TODOS los módulos que la usan.

### Contexto de app
Solo vía hooks de `hooks/useAccount.ts`: `usePlanLimit(feature)`, `useSubscription()`. Esos usan `useApp()` internamente. **Nunca** llamar `useApp()` directo en páginas.

### Recursos compartidos obligatorios (no inventar variantes)
`SkeletonView`/`SkeletonForm` (`components/skeletons.tsx`), `ItemsPaginator`, `ConfirmDeleteDialog`, `Dialog`/`AlertDialog`/`Switch` (deep imports `@katenda_clients/ui/*`), `useI18n`, `DynamicIcon`, `cn`, `slugify`, `dataUrlToFile` (`lib/utils.ts`).

### Validaciones y errores
- Cliente: solo lo esencial (campo requerido, formatos) → `toast.error` con clave i18n.
- Backend: 422/409/429 llegan con `message` → `toast.error(errMsg(err, fallback))`.
- Plan limit: en `create` vía `usePlanLimit` + count real (`meta.total` con `?status=all&per_page=1` o el total paginado).

### Checklist de verificación (obligatorio al cerrar un módulo)
1. `pnpm --filter web check-types`
2. `pnpm --filter web lint`
3. `pnpm --filter web build` (chunks por módulo OK)
4. Smoke manual contra API real (crear/editar/ver/eliminar + media si aplica).

---

## Fuentes de verdad

| Tema | Archivo |
|---|---|
| Patrón de módulo (este doc) | `katenda_clients/AGENTS.md` |
| Contrato API / backend | `katenda_api/AGENTS.md` + `katenda_api/_context/app-doc.md` |
| Roadmap y estado del frontend | `ROADMAP.md` (raíz del workspace) |
| Diseño de referencia | `katenda-web` (Next.js) para módulos ya portados; **`katenda-your-online-storefront` (Lovable) para los módulos que katenda-web no cubre** |
| Código canónico del patrón | `apps/web/src/pages/app/categories/*` (+ `roles/*` para detalle/edit fiel a Lovable) |
