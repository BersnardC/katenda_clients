"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "./i18n";
import { getClientSlug } from "./clientSlug";
import { createOrder } from "@/services/orderService";
import {
  buildOrderMessage,
  normalizeWhatsappSettings,
  whatsappLink,
  type OrderMessageLine,
} from "./whatsapp";
import type { Customer, CustomerOrder } from "./customerAuth";
import type { Store } from "@/types/models";

export type OrderPhase = "idle" | "registering" | "done";

export interface OrderLineInput extends OrderMessageLine {
  /** UUID del producto (para registrar el pedido). */
  id: string;
}

// Duración de la "cortesía": intento de auto-apertura tras registrar (evita
// blockers de pop-ups, que requieren gesto del usuario en el botón manual).
const AUTO_OPEN_DELAY_MS = 600;

interface UseOrderWhatsappOptions {
  store: Store;
  /** Teléfono de respaldo si la tienda no tiene contacto whatsapp (account.phone). */
  fallbackPhone?: string | null;
  customer: Customer | null;
  /** Se invoca cuando el usuario no está logueado (ir a /cuenta). */
  requireLogin: () => void;
  /** Se invoca cuando WhatsApp se abrió con éxito (p. ej. limpiar carrito). */
  onSent: () => void;
}

/**
 * Flujo "registrar pedido → enviar por WhatsApp" en 2 pasos:
 *  1. register() registra el pedido en el backend y arma el link wa.me con la
 *     plantilla configurada por la tienda.
 *  2. Tras el éxito intenta abrir WhatsApp automáticamente (cortesía). Si el
 *     navegador bloquea el pop-up queda en `done` con send() disponible para
 *     que el propio usuario haga el clic (nunca bloqueado).
 */
export function useOrderWhatsapp({
  store,
  fallbackPhone,
  customer,
  requireLogin,
  onSent,
}: UseOrderWhatsappOptions) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<OrderPhase>("idle");
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [link, setLink] = useState("");
  const busyRef = useRef(false);
  const autoTimerRef = useRef<number | null>(null);

  const waPhone =
    store.contacts?.find((c) => c.type === "whatsapp")?.value ??
    fallbackPhone ??
    "";
  const wa = normalizeWhatsappSettings(store.settings);

  const finishSent = useCallback(() => {
    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    onSent();
    setPhase("idle");
    setOrder(null);
    setLink("");
  }, [onSent]);

  const openUrl = useCallback((url: string): boolean => {
    let win: Window | null = null;
    try {
      win = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      win = null;
    }
    return win !== null;
  }, []);

  const register = useCallback(
    async (lines: OrderLineInput[], customerName?: string) => {
      if (busyRef.current || phase !== "idle" || lines.length === 0) return;

      const slug = getClientSlug();
      if (!slug) {
        toast.error(t("store.orderError"));
        return;
      }
      if (!customer) {
        requireLogin();
        return;
      }
      if (!waPhone) {
        toast.error(t("store.noWhatsapp"));
        return;
      }

      busyRef.current = true;
      setPhase("registering");
      try {
        const created = await createOrder(slug, {
          items: lines.map((l) => ({ product_uuid: l.id, qty: l.qty })),
        });

        const message = buildOrderMessage({
          wa,
          storeName: store.name,
          cliente: customerName?.trim() || customer.name || "Cliente",
          lines,
          currency: store.currency?.code ?? "USD",
        });
        const url = whatsappLink(waPhone, message);
        if (!url) {
          toast.error(t("store.noWhatsapp"));
          setPhase("idle");
          return;
        }

        setOrder(created);
        setLink(url);
        setPhase("done");
        toast.success(t("store.orderRegistered", { code: created.code }));

        // Cortesía: auto-apertura en una llamada síncrona separada del await.
        // Si el navegador la bloquea, send() (clic del usuario) es el respaldo.
        autoTimerRef.current = window.setTimeout(() => {
          if (openUrl(url)) {
            finishSent();
          } else {
            toast.info(t("store.popupBlocked"));
          }
        }, AUTO_OPEN_DELAY_MS);
      } catch (e) {
        const message =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: string }).message ?? "")
            : "";
        toast.error(message || t("store.orderError"));
        setPhase("idle");
      } finally {
        busyRef.current = false;
      }
    },
    [phase, customer, waPhone, wa, store, requireLogin, finishSent, openUrl, t],
  );

  /** Apertura manual (clic del usuario): no la bloquea ningún navegador. */
  const send = useCallback(() => {
    if (!link) return;
    if (openUrl(link)) {
      finishSent();
    } else {
      toast.info(t("store.popupBlocked"));
    }
  }, [link, openUrl, finishSent, t]);

  /** Vuelve al estado normal (p. ej. "seguir comprando" o carrito modificado). */
  const reset = useCallback(() => {
    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setPhase("idle");
    setOrder(null);
    setLink("");
  }, []);

  return { phase, order, link, register, send, reset, waPhone };
}
