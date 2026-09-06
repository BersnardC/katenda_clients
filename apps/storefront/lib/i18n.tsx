"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Lang = "es" | "en";

const dict = {
  es: {
    "store.nav.home": "Inicio",
    "store.nav.categories": "Categorías",
    "store.nav.products": "Productos",
    "store.nav.contact": "Contacto",
    "store.verified": "Verificada",
    "store.verifiedTitle": "Tienda verificada: RIF y datos de empresa confirmados",
    "store.search": "Buscar productos...",
    "store.all": "Todas",
    "store.products": "Productos",
    "store.results": "resultados",
    "store.empty": "No encontramos productos con ese criterio.",
    "store.viewCart": "Ver carrito",
    "store.cart": "Tu carrito",
    "store.cartEmpty": "Tu carrito está vacío.",
    "store.customerName": "Tu nombre",
    "store.total": "Total",
    "store.sendOrder": "Enviar pedido por WhatsApp",
    "store.sendHint": "Se abrirá WhatsApp al {phone} con el resumen de tu pedido.",
    "store.addAria": "Agregar {name} al carrito",
    "store.quantity": "{count} · {total}",
    "store.cartClose": "Cerrar carrito",
    "store.removeOne": "Quitar uno",
    "store.addOne": "Agregar uno",
    "store.maxStock": "Llegaste al stock disponible",
    "store.openMenu": "Abrir menú",
    "store.closeMenu": "Cerrar menú",
    "store.enter": "Entrar",
    "store.myAccount": "Mi cuenta",
    "store.logout": "Salir",
    "store.loginRequired": "Inicia sesión para hacer tu pedido",
    "store.orderRegistering": "Registrando tu pedido…",
    "store.orderCreated": "¡Pedido registrado! Se abrirá WhatsApp…",
    "store.orderError": "No se pudo registrar el pedido. Inténtalo de nuevo.",
    "store.backStore": "Volver a la tienda",
    "cuenta.title": "Mi cuenta",
    "cuenta.login": "Inicia sesión",
    "cuenta.loginSub": "Para comprar y seguir tus pedidos en {store}.",
    "cuenta.register": "Crea tu cuenta",
    "cuenta.registerSub": "Para comprar y seguir tus pedidos en {store}.",
    "cuenta.name": "Nombre",
    "cuenta.namePh": "Tu nombre",
    "cuenta.email": "Correo",
    "cuenta.emailPh": "tucorreo@email.com",
    "cuenta.password": "Contraseña",
    "cuenta.passwordPh": "••••••••",
    "cuenta.submitLogin": "Entrar",
    "cuenta.submitRegister": "Registrarme",
    "cuenta.toggleRegister": "¿No tienes cuenta? Regístrate",
    "cuenta.toggleLogin": "Ya tengo cuenta, iniciar sesión",
    "cuenta.hello": "Hola, {name}",
    "cuenta.tabOrders": "Mis pedidos",
    "cuenta.tabProfile": "Mi perfil",
    "cuenta.noOrders": "Todavía no tienes pedidos.",
    "cuenta.total": "Total",
    "cuenta.save": "Guardar cambios",
    "cuenta.saved": "Datos guardados",
    "cuenta.phone": "Teléfono",
    "cuenta.phonePh": "0412 000 0000",
    "cuenta.address": "Dirección de entrega",
    "cuenta.addressPh": "Calle, edificio, apto",
    "cuenta.city": "Ciudad",
    "cuenta.cityPh": "Caracas",
    "cuenta.deliveryNotes": "Notas para el delivery",
    "cuenta.deliveryNotesPh": "Referencias, horario preferido…",
    "cuenta.ordersEmpty": "Todavía no tienes pedidos.",
    "order.status.pendiente": "Pendiente",
    "order.status.confirmado": "Confirmado",
    "order.status.preparando": "Preparando",
    "order.status.enviado": "Enviado",
    "order.status.entregado": "Entregado",
    "order.status.cancelado": "Cancelado",
    "order.items": "productos",
    "product.back": "Tienda",
    "product.subtotal": "Subtotal",
    "product.addToCart": "Agregar al carrito",
    "product.added": "Agregado al carrito",
    "product.outOfStock": "Producto agotado",
    "product.orderWhatsapp": "Pedir por WhatsApp",
    "product.delivery": "Coordinamos entrega por WhatsApp al {phone}",
    "product.description": "Descripción",
    "product.related": "También te puede gustar",
    "product.viewImage": "Ver imagen {index}",
    "product.notFound": "Producto no disponible",
    "product.backStore": "Volver a la tienda",
    "notFound.title": "Tienda no encontrada",
    "notFound.sub": "Verifica el enlace o vuelve a intentarlo.",
    "notFound.home": "Ir al inicio",
  },
  en: {
    "store.nav.home": "Home",
    "store.nav.categories": "Categories",
    "store.nav.products": "Products",
    "store.nav.contact": "Contact",
    "store.verified": "Verified",
    "store.verifiedTitle": "Verified store: Tax ID and company data confirmed",
    "store.search": "Search products...",
    "store.all": "All",
    "store.products": "Products",
    "store.results": "results",
    "store.empty": "No products match that criteria.",
    "store.viewCart": "View cart",
    "store.cart": "Your cart",
    "store.cartEmpty": "Your cart is empty.",
    "store.customerName": "Your name",
    "store.total": "Total",
    "store.sendOrder": "Send order on WhatsApp",
    "store.sendHint": "WhatsApp will open with a summary of your order sent to {phone}.",
    "store.addAria": "Add {name} to cart",
    "store.quantity": "{count} · {total}",
    "store.cartClose": "Close cart",
    "store.removeOne": "Remove one",
    "store.addOne": "Add one",
    "store.maxStock": "You reached the available stock",
    "store.openMenu": "Open menu",
    "store.closeMenu": "Close menu",
    "store.enter": "Sign in",
    "store.myAccount": "My account",
    "store.logout": "Log out",
    "store.loginRequired": "Sign in to place your order",
    "store.orderRegistering": "Registering your order…",
    "store.orderCreated": "Order registered! WhatsApp will open…",
    "store.orderError": "Could not register the order. Try again.",
    "store.backStore": "Back to the store",
    "cuenta.title": "My account",
    "cuenta.login": "Sign in",
    "cuenta.loginSub": "To buy and track your orders at {store}.",
    "cuenta.register": "Create your account",
    "cuenta.registerSub": "To buy and track your orders at {store}.",
    "cuenta.name": "Name",
    "cuenta.namePh": "Your name",
    "cuenta.email": "Email",
    "cuenta.emailPh": "you@email.com",
    "cuenta.password": "Password",
    "cuenta.passwordPh": "••••••••",
    "cuenta.submitLogin": "Sign in",
    "cuenta.submitRegister": "Sign up",
    "cuenta.toggleRegister": "No account? Sign up",
    "cuenta.toggleLogin": "Already have an account? Sign in",
    "cuenta.hello": "Hello, {name}",
    "cuenta.tabOrders": "My orders",
    "cuenta.tabProfile": "My profile",
    "cuenta.noOrders": "You have no orders yet.",
    "cuenta.total": "Total",
    "cuenta.save": "Save changes",
    "cuenta.saved": "Saved",
    "cuenta.phone": "Phone",
    "cuenta.phonePh": "0412 000 0000",
    "cuenta.address": "Delivery address",
    "cuenta.addressPh": "Street, building, apt",
    "cuenta.city": "City",
    "cuenta.cityPh": "Caracas",
    "cuenta.deliveryNotes": "Delivery notes",
    "cuenta.deliveryNotesPh": "References, preferred time…",
    "cuenta.ordersEmpty": "You have no orders yet.",
    "order.status.pendiente": "Pending",
    "order.status.confirmado": "Confirmed",
    "order.status.preparando": "Preparing",
    "order.status.enviado": "Shipped",
    "order.status.entregado": "Delivered",
    "order.status.cancelado": "Cancelled",
    "order.items": "items",
    "product.back": "Store",
    "product.subtotal": "Subtotal",
    "product.addToCart": "Add to cart",
    "product.added": "Added to cart",
    "product.outOfStock": "Out of stock",
    "product.orderWhatsapp": "Order on WhatsApp",
    "product.delivery": "We arrange delivery on WhatsApp at {phone}",
    "product.description": "Description",
    "product.related": "You may also like",
    "product.viewImage": "View image {index}",
    "product.notFound": "Product unavailable",
    "product.backStore": "Back to store",
    "notFound.title": "Store not found",
    "notFound.sub": "Check the link and try again.",
    "notFound.home": "Go home",
  },
} as const;

export type Key = keyof (typeof dict)["es"];

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved =
      typeof window !== "undefined" &&
      localStorage.getItem("katenda.lang");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "es" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("katenda.lang", l);
  };

  const t: Ctx["t"] = (k, vars) => {
    let text: string = dict[lang][k] ?? k;
    if (vars) {
      for (const [key, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${key}}`, String(value));
      }
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
