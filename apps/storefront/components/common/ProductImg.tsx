"use client";

import { useEffect, useRef, useState } from "react";

// Imagen de producto con <img> NATIVO (sin next/image): las imágenes ya se
// optimizan al subirse y se sirven en webp desde el backend. Aquí solo se
// controla cuándo/cómo carga el navegador:
//  - `lazy` (default) + `decoding="async"` para imágenes bajo el fold.
//  - `priority` (LCP): eager + `fetchPriority="high"` y sin fade.
//  - Fade-in suave al terminar de cargar (evita el "pop" al hacer scroll).
export function ProductImg({
  src,
  alt,
  className = "",
  loading = "lazy",
  priority = false,
  fade = true,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  /** lazy (default) bajo el fold; solo pasar "eager" si está arriba. */
  loading?: "lazy" | "eager";
  /** LCP: eager + fetchPriority="high" + sin fade. */
  priority?: boolean;
  /** Fade-in suave al terminar de cargar. */
  fade?: boolean;
}) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Imágenes ya en caché pueden terminar de cargar antes de hidratar onLoad.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  if (!src) return null;

  const fadeEnabled = fade && !priority;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={priority ? "eager" : loading}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-200 ${
        fadeEnabled ? (loaded ? "opacity-100" : "opacity-0") : ""
      }`.trim()}
    />
  );
}
