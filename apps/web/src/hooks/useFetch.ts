import { useCallback, useEffect, useRef, useState } from "react";

// Fetch simple: sin caché. Llama al service una vez al montar
// y expone refetch() para recargar manualmente cuando se necesite.
export function useFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetcherRef.current();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
