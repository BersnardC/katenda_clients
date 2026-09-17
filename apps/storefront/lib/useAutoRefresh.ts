"use client";

import { useEffect, useRef } from "react";

// Marca por clave (ej. `catalog:{slug}`, `product:{slug}:{uuid}`): limita a 1
// refresco cada `minIntervalMs` aunque la misma vista se monte varias veces
// (entrar/salir del home o reentrar al mismo producto). Vistas distintas
// (home vs. cada producto) tienen su propia marca y no se bloquean entre sí.
const lastRunByKey: Record<string, number> = {};

interface UseAutoRefreshOptions<T> {
  /** Clave de throttling (catálogo del slug, producto uuid, …). */
  key: string;
  /** Carga fresca (no-store). Si falla, el error se ignora en silencio. */
  load: () => Promise<T>;
  /** Aplica los datos frescos (setState del caller). */
  onData: (data: T) => void;
  enabled?: boolean;
  /** Intervalo mínimo entre refrescos de la misma clave. */
  minIntervalMs?: number;
  /** Tiempo mínimo oculta la pestaña para refrescar al volver al foco. */
  hiddenThresholdMs?: number;
  /** Retraso inicial tras el montaje (pintado SSR primero). */
  initialDelayMs?: number;
}

/**
 * Refresco en caliente al montar y al volver a la pestaña (solo si estuvo
 * oculta más de `hiddenThresholdMs`). Pensado para catálogos server-cacheados
 * (ISR/Data Cache): el primer pintado sigue siendo el del servidor y este
 * refresco trae los cambios publicados por el comercio sin recargar.
 */
export function useAutoRefresh<T>({
  key,
  load,
  onData,
  enabled = true,
  minIntervalMs = 8_000,
  hiddenThresholdMs = 10_000,
  initialDelayMs = 600,
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

    const run = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      const now = Date.now();
      if (now - (lastRunByKey[key] ?? 0) < minIntervalMs) return;
      lastRunByKey[key] = now;
      loadRef.current()
        .then((data) => onDataRef.current(data))
        .catch(() => {
          /* silencioso: se conserva lo que ya está en pantalla */
        });
    };

    // Primer refresco al montar, tras dejar pintar el SSR.
    const timer = window.setTimeout(run, initialDelayMs);

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
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [key, enabled, minIntervalMs, hiddenThresholdMs, initialDelayMs]);
}
