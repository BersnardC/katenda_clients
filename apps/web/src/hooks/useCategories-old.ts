import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categoryService, type CategoryStatus } from "@/services/categoryService";
import { useFetch } from "@/hooks/useFetch";
import type { Category } from "@/types/models";
import type { PaginationMeta } from "@/types/pagination";

export const CATEGORIES_PAGE_SIZE = 20;

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

// Match por name (case-insensitive) + status. Usado para el filtro cliente
// y para decidir si un item recién creado calza con el filtro visible.
export function matchesCategoryFilter(
  c: Category,
  status: CategoryStatus,
  search: string,
): boolean {
  const term = search.trim().toLowerCase();
  const matchText = !term || c.name.toLowerCase().includes(term);
  const matchStatus =
    status === "all" || (status === "active" ? c.status === 1 : c.status === 0);
  return matchText && matchStatus;
}

function filterItems(
  pool: Category[],
  status: CategoryStatus,
  search: string,
): Category[] {
  return pool.filter((c) => matchesCategoryFilter(c, status, search));
}

// Listado híbrido: filtra en el cliente sobre el pool ya cargado y, si no
// hay resultados, delega al backend (?status= + ?search=). Sin react-query.
export function useHybridCategories() {
  const [q, setQState] = useState("");
  const [status, setStatusState] = useState<CategoryStatus>("all");
  const [mode, setMode] = useState<"client" | "server">("client");
  const debouncedSearch = useDebouncedValue(q.trim(), 250);

  const [pages, setPages] = useState<Category[][]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reqIdRef = useRef(0);

  const params = useMemo(
    () =>
      mode === "server"
        ? {
            status,
            search: debouncedSearch || q.trim() || undefined,
            addons: "products_count",
            per_page: CATEGORIES_PAGE_SIZE,
          }
        : {
            status: "all" as CategoryStatus,
            search: undefined,
            addons: "products_count",
            per_page: CATEGORIES_PAGE_SIZE,
          },
    [mode, status, debouncedSearch, q],
  );

  useEffect(() => {
    const id = ++reqIdRef.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    categoryService
      .index({ ...params, page: 1 })
      .then((res) => {
        if (id !== reqIdRef.current) return;
        setPages([res.data]);
        setMeta(res.meta);
      })
      .catch((e) => {
        if (id !== reqIdRef.current) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (id === reqIdRef.current) setLoading(false);
      });
  }, [params, reloadKey]);

  const loadMore = useCallback(async () => {
    if (!meta || loading || loadingMore) return;
    if (meta.current_page >= meta.last_page) return;
    const id = ++reqIdRef.current;
    setLoadingMore(true);
    try {
      const res = await categoryService.index({
        ...params,
        page: meta.current_page + 1,
      });
      if (id !== reqIdRef.current) return;
      setPages((p) => [...p, res.data]);
      setMeta(res.meta);
    } catch (e) {
      if (id === reqIdRef.current) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    } finally {
      if (id === reqIdRef.current) setLoadingMore(false);
    }
  }, [meta, loading, loadingMore, params]);

  const poolItems = useMemo(() => pages.flat(), [pages]);
  const clientFiltered = useMemo(
    () => filterItems(poolItems, status, q),
    [poolItems, status, q],
  );

  const updateFilter = useCallback(
    (nextQ: string, nextStatus: CategoryStatus) => {
      setQState(nextQ);
      setStatusState(nextStatus);
      const nextActive = nextQ.trim() !== "" || nextStatus !== "all";
      const matches = filterItems(poolItems, nextStatus, nextQ);
      if (mode === "client" && nextActive && matches.length === 0) {
        setMode("server");
      } else if (mode === "server" && !nextActive) {
        setMode("client");
      }
    },
    [mode, poolItems],
  );

  const setQ = (v: string) => updateFilter(v, status);
  const setStatus = (v: CategoryStatus) => updateFilter(q, v);

  // Optimistic helpers (sin refetch): mutan el pool localmente.
  const prependCategory = useCallback((cat: Category) => {
    setPages((p) => (p.length === 0 ? [[cat]] : [[cat, ...p[0]], ...p.slice(1)]));
    setMeta((m) => (m ? { ...m, total: m.total + 1 } : m));
  }, []);

  const patchCategory = useCallback((uuid: string, patch: Partial<Category>) => {
    setPages((p) =>
      p.map((page) =>
        page.map((c) => (c.uuid === uuid ? { ...c, ...patch } : c)),
      ),
    );
  }, []);

  const removeCategory = useCallback((uuid: string) => {
    setPages((p) =>
      p
        .map((page) => page.filter((c) => c.uuid !== uuid))
        .filter((page) => page.length > 0),
    );
    setMeta((m) => (m ? { ...m, total: Math.max(0, m.total - 1) } : m));
  }, []);

  const items = mode === "server" ? poolItems : clientFiltered;
  const total = meta?.total;
  const hasMore = meta ? meta.current_page < meta.last_page : false;

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    items,
    total,
    q,
    setQ,
    status,
    setStatus,
    mode,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    error,
    refetch,
    prependCategory,
    patchCategory,
    removeCategory,
  };
}

export function useCategoriesCount() {
  return useFetch(() => categoryService.index({ status: "all", per_page: 1 }));
}

export function useCategory(uuid: string) {
  return useFetch(async () => {
    const res = await categoryService.show(uuid, { addons: "products_count" });
    return res.data;
  });
}

// Pool completo (todas las páginas) para resolver padre/subcategorías
// en detalle y edición.
export function useAllCategories() {
  return useFetch(async () => {
    const all: Category[] = [];
    let page = 1;
    for (;;) {
      const res = await categoryService.index({
        status: "all",
        page,
        per_page: CATEGORIES_PAGE_SIZE,
      });
      all.push(...res.data);
      if (page >= res.meta.last_page) break;
      page += 1;
    }
    return all;
  });
}
