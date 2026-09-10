"use client";

// Persistencia mínima (sessionStorage) para recordar que el usuario venía
// a hacer un pedido y debe volver al carrito después de autenticarse.

const CHECKOUT_INTENT_KEY = "katenda.checkout_intent";
const OPEN_CART_KEY = "katenda.open_cart";

/** Guarda la ruta a la que volver tras login/registro. */
export function setCheckoutIntent(returnTo: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CHECKOUT_INTENT_KEY, returnTo);
  } catch {
    /* modo privado / sin espacio */
  }
}

/** Lee y limpia la ruta de retorno (consumir una sola vez). */
export function takeCheckoutIntent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(CHECKOUT_INTENT_KEY);
    if (value) window.sessionStorage.removeItem(CHECKOUT_INTENT_KEY);
    return value;
  } catch {
    return null;
  }
}

/** Marca que, al volver, el carrito debe abrirse automáticamente. */
export function setOpenCartOnReturn(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(OPEN_CART_KEY, "1");
  } catch {
    /* noop */
  }
}

/** Lee y limpia la marca de "abrir carrito" (consumir una sola vez). */
export function takeOpenCartOnReturn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const value = window.sessionStorage.getItem(OPEN_CART_KEY);
    if (value) window.sessionStorage.removeItem(OPEN_CART_KEY);
    return value === "1";
  } catch {
    return false;
  }
}
