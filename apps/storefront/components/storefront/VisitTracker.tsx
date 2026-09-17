"use client";

import { useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const VISITOR_KEY = "katenda.visitor_id";
const THROTTLE_MS = 30 * 60 * 1000; // 30 minutos

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

function md5Simple(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Registra un page view en la API pública (POST /s/{slug}/visits).
 * Throttling: no envía si la última visita para (slug, path) fue hace < 30 min.
 * Los errores se ignoran para no afectar la tienda.
 */
export function VisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;

    const path = window.location.pathname;
    const throttleKey = `katenda.visit.${slug}.${md5Simple(path)}`;

    try {
      const lastVisit = localStorage.getItem(throttleKey);
      if (lastVisit && Date.now() - Number(lastVisit) < THROTTLE_MS) {
        return;
      }
      localStorage.setItem(throttleKey, String(Date.now()));
    } catch {
      // localStorage no disponible (incognito estricto, etc.) — continuar
    }

    fetch(`${API_BASE_URL}/s/${slug}/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        path,
        visitor_id: getVisitorId(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
