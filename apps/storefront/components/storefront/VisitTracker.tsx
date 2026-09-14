"use client";

import { useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const VISITOR_KEY = "katenda.visitor_id";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/**
 * Registra un page view en la API pública (POST /s/{slug}/visits).
 * Se monta una vez por carga de página; los errores se ignoran para no
 * afectar la tienda.
 */
export function VisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;

    fetch(`${API_BASE_URL}/s/${slug}/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        path: window.location.pathname,
        visitor_id: getVisitorId(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
