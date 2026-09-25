import { useEffect, useRef } from "react";

// Marca por clave (ej. `orders:list`, `order:{uuid}`): limita a 1 refresco
// cada `minIntervalMs` aunque la misma vista se monte varias veces
// (entrar/salir y volver). Vistas distintas tienen su propia marca.
const lastRunByKey: Record<string, number> = {};

interface UseAutoRefreshOptions<T> {
  /** Clave de throttling (lista de pedidos, uuid del pedido, …). */
  key: string;
  /** Carga fresca. Si falla, el error se ignora en silencio. */
  load: () => Promise<T>;
  /** Aplica los datos frescos (setState del caller). */
  onData: (data: T) => void;
  enabled?: boolean;
  /** Intervalo mínimo entre refrescos de la misma clave. */
  minIntervalMs?: number;
  /** Tiempo mínimo oculta la pestaña para refrescar al volver al foco. */
  hiddenThresholdMs?: number;
  /** Retraso inicial tras el montaje (pintado primero). */
  initialDelayMs?: number;
  /** Bucle real: refresco cada `intervalMs` mientras esté habilitado. Sin
   *  esta opción solo refresca al montar y al volver de la pestaña. */
  intervalMs?: number;
}

/**
 * Refresco en caliente al montar, al volver a la pestaña (si estuvo oculta
 * más de `hiddenThresholdMs`) y, si se pasa `intervalMs`, en bucle. El tick
 * se salta con la pestaña oculta. Los errores de red se ignoran: se conserva
 * lo que ya está en pantalla.
 */
export function useAutoRefresh<T>({
  key,
  load,
  onData,
  enabled = true,
  minIntervalMs = 8_000,
  hiddenThresholdMs = 10_000,
  initialDelayMs = 600,
  intervalMs,
}: UseAutoRefreshOptions<T>) {
  const loadRef = useRef(load);
  const onDataRef = useRef(onData);
  const hiddenAtRef = useRef<number | null>(null);

  // Mantener siempre la versión vigente sin depender de deps del efecto.
  useEffect(() => {
    loadRef.current = load;
  });
  useEffect(() => {
    onDataRef.current = onData;
  });

  useEffect(() => {
    if (!enabled) return;

    // El throttle nunca puede ser mayor que el propio bucle (si no, el
    // intervalo se comería todos los ticks).
    const throttleMs = intervalMs
      ? Math.min(minIntervalMs, intervalMs)
      : minIntervalMs;

    const run = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      const now = Date.now();
      if (now - (lastRunByKey[key] ?? 0) < throttleMs) return;
      lastRunByKey[key] = now;
      loadRef.current()
        .then((data) => onDataRef.current(data))
        .catch(() => {
          /* silencioso: se conserva lo que ya está en pantalla */
        });
    };

    // Primer refresco tras `initialDelayMs`.
    const timer = window.setTimeout(run, initialDelayMs);
    const interval = intervalMs
      ? window.setInterval(run, intervalMs)
      : undefined;

    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }
      const hiddenMs =
        hiddenAtRef.current == null ? 0 : Date.now() - hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (hiddenMs >= hiddenThresholdMs) run();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      if (interval !== undefined) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    key,
    enabled,
    minIntervalMs,
    hiddenThresholdMs,
    initialDelayMs,
    intervalMs,
  ]);
}
