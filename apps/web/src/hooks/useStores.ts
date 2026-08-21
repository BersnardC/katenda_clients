import { useCallback, useEffect, useState } from "react";
import { storeService, type ListParams } from "@/services/storeService";
import type { Paginated } from "@/types/pagination";
import type { Store } from "@/types/models";

export function useStores(params?: ListParams) {
  const [data, setData] = useState<Paginated<Store> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    storeService
      .list(params)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [params, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refetch };
}

export function useStore(uuid: string) {
  const [data, setData] = useState<{ data: Store } | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!uuid) return;
    let alive = true;
    storeService
      .show(uuid)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [uuid, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refetch };
}
