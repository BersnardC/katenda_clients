"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useCustomerAuth } from "@/lib/customerAuth";
import { ACCENT_FALLBACK } from "@/lib/store";
import { fmtCurrency } from "@/lib/format";
import { useOrderWhatsapp } from "@/lib/useOrderWhatsapp";
import type { Store, StorefrontAccount } from "@/types/models";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  store: Store;
  account?: StorefrontAccount | null;
}

/**
 * Drawer reutilizable del carrito (tienda + página de producto).
 * Un solo flujo de compra: ajustar cantidades, quitar ítems, vaciar,
 * iniciar sesión y registrar el pedido por WhatsApp.
 */
export function CartDrawer({ open, onClose, store, account }: CartDrawerProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { lines, total, changeQty, remove, clear } = useCart();
  const { customer } = useCustomerAuth();
  const isLoggedIn = Boolean(customer);
  const [customerName, setCustomerName] = useState("");

  const accent = store.accent_color ?? ACCENT_FALLBACK;
  const primaryCurrency = store.currency?.code ?? "USD";
  const waPhone =
    store.contacts?.find((c) => c.type === "whatsapp")?.value ??
    account?.phone ??
    "";

  // Pedido → WhatsApp en 2 pasos: registra el pedido y lo abre (o deja el
  // botón habilitado para que el propio usuario haga el clic).
  const {
    phase: orderPhase,
    order: registeredOrder,
    register: registerOrder,
    send: openWhatsapp,
    reset: resetOrder,
  } = useOrderWhatsapp({
    store,
    fallbackPhone: account?.phone,
    customer,
    requireLogin: () => router.push("/account"),
    onRegistered: clear,
  });

  const handleCheckout = () => {
    registerOrder(
      lines.map((l) => ({
        id: l.id,
        name: l.name,
        price: l.price,
        qty: l.qty,
      })),
      customerName,
    );
  };

  const handleKeepShopping = () => {
    clear();
    resetOrder();
  };

  // Si el carrito cambia tras registrar el pedido, el enlace de WhatsApp ya no
  // corresponde → volver al estado normal (evita enviar un resumen viejo).
  const cartKey = lines.map((l) => `${l.id}x${l.qty}`).join("|");
  const registeredKeyRef = useRef<string | null>(null);
  const prevPhaseRef = useRef(orderPhase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = orderPhase;
    if (orderPhase === "done" && prev !== "done") {
      registeredKeyRef.current = cartKey;
      return;
    }
    if (prev === "done" && orderPhase !== "done") {
      registeredKeyRef.current = null;
      return;
    }
    if (
      orderPhase === "done" &&
      registeredKeyRef.current !== null &&
      registeredKeyRef.current !== cartKey
    ) {
      resetOrder();
    }
  }, [cartKey, orderPhase, resetOrder]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label={t("store.cartClose")}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <aside className="relative w-full sm:max-w-md h-full bg-background border-l border-border flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <h2 className="font-display font-bold text-lg">
            {t("store.cart")}
          </h2>
          <div className="flex items-center gap-2">
            {lines.length > 0 && (
              <button
                onClick={clear}
                className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-surface border border-border text-xs font-semibold text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="size-3.5" /> {t("store.clearCart")}
              </button>
            )}
            <button
              onClick={onClose}
              className="size-9 grid place-items-center rounded-full bg-surface border border-border"
              aria-label={t("store.cartClose")}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {lines.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <ShoppingBag className="size-10 mx-auto mb-3 opacity-50" />
              <p>{t("store.cartEmpty")}</p>
            </div>
          ) : (
            lines.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
              >
                {l.image && (
                  <img
                    src={l.image}
                    alt={l.name}
                    className="size-14 rounded-xl object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{l.name}</p>
                  <p className="text-sm" style={{ color: accent }}>
                    {fmtCurrency(l.price * l.qty, primaryCurrency)}
                  </p>
                  {l.stock > 0 && l.qty >= l.stock && (
                    <p className="text-[11px] text-muted-foreground">
                      {t("store.maxStock")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => changeQty(l.id, -1)}
                    className="size-8 grid place-items-center rounded-full bg-surface border border-border"
                    aria-label={t("store.removeOne")}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {l.qty}
                  </span>
                  <button
                    onClick={() => changeQty(l.id, 1)}
                    disabled={l.stock > 0 && l.qty >= l.stock}
                    className="size-8 grid place-items-center rounded-full bg-surface border border-border disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={t("store.addOne")}
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    onClick={() => remove(l.id)}
                    className="size-8 grid place-items-center rounded-full bg-surface border border-border text-muted-foreground hover:text-destructive transition"
                    aria-label={t("store.removeItem", { name: l.name })}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-5 space-y-3 safe-bottom">
          {!isLoggedIn ? (
            <Link
              href="/account"
              className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2"
            >
              <UserRound className="size-5" /> {t("store.loginRequired")}
            </Link>
          ) : orderPhase === "done" && registeredOrder ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 p-3">
                <span className="size-7 shrink-0 rounded-full bg-[#25D366] text-white grid place-items-center">
                  <Check className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-snug">
                    {t("store.orderRegistered", {
                      code: registeredOrder.code,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {t("store.orderRegisteredHint")}
                  </p>
                </div>
              </div>
              <button
                onClick={openWhatsapp}
                className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="size-5" />
                {t("store.openWhatsapp")}
              </button>
              <button
                onClick={handleKeepShopping}
                className="w-full h-11 rounded-2xl bg-surface border border-border text-sm font-semibold"
              >
                {t("store.keepShopping")}
              </button>
            </div>
          ) : (
            <>
              <input
                value={customerName || customer?.name || ""}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t("store.customerName")}
                maxLength={60}
                className="w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none text-sm"
              />
              <div className="flex items-center justify-between font-display font-bold text-lg">
                <span>{t("store.total")}</span>
                <span style={{ color: accent }}>
                  {fmtCurrency(total, primaryCurrency)}
                </span>
              </div>
              <button
                disabled={lines.length === 0 || orderPhase === "registering"}
                onClick={handleCheckout}
                className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {orderPhase === "registering" ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <MessageCircle className="size-5" />
                )}
                {orderPhase === "registering"
                  ? t("store.orderRegistering")
                  : t("store.sendOrder")}
              </button>
            </>
          )}
          <p className="text-xs text-muted-foreground text-center">
            {t("store.sendHint", { phone: waPhone })}
          </p>
        </div>
      </aside>
    </div>
  );
}
