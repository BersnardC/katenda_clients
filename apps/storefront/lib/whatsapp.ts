import { fmtCurrency, fmtDate } from "./format";
import type { StoreSettings, WhatsappSettings } from "@/types/models";

export const DEFAULT_WHATSAPP_TEMPLATE =
  "¡Hola {tienda}! 👋\nSoy {cliente} y quiero pedir:\n\n{productos}\n\nTotal: {total}\nFecha: {fecha}\n¡Gracias!";

export const DEFAULT_WHATSAPP_SETTINGS: WhatsappSettings = {
  template: DEFAULT_WHATSAPP_TEMPLATE,
  include_photo: true,
  include_total: true,
  include_note: false,
  note: "",
};

// Normaliza las settings de la tienda a WhatsappSettings, aplicando el default
// si falta la configuración (`whatsapp`) o algún campo.
export function normalizeWhatsappSettings(
  settings?: StoreSettings | null,
): WhatsappSettings {
  const wa = settings?.whatsapp;
  return {
    template: wa?.template ?? DEFAULT_WHATSAPP_SETTINGS.template,
    include_photo: wa?.include_photo ?? DEFAULT_WHATSAPP_SETTINGS.include_photo,
    include_total: wa?.include_total ?? DEFAULT_WHATSAPP_SETTINGS.include_total,
    include_note: wa?.include_note ?? DEFAULT_WHATSAPP_SETTINGS.include_note,
    note: wa?.note ?? DEFAULT_WHATSAPP_SETTINGS.note,
  };
}

export function renderWhatsappMessage(
  tpl: string,
  vars: {
    cliente: string;
    tienda: string;
    productos: string;
    total: string;
    fecha: string;
  },
) {
  return tpl
    .replace(/\{cliente\}/g, vars.cliente)
    .replace(/\{tienda\}/g, vars.tienda)
    .replace(/\{productos\}/g, vars.productos)
    .replace(/\{total\}/g, vars.total)
    .replace(/\{fecha\}/g, vars.fecha);
}

export function whatsappLink(phone: string, text: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export interface OrderMessageLine {
  name: string;
  qty: number;
  price: number;
}

// Arma el mensaje final del pedido (carrito o producto directo) con la
// plantilla configurada por la tienda + nota opcional.
export function buildOrderMessage(opts: {
  wa: WhatsappSettings;
  storeName: string;
  cliente: string;
  lines: OrderMessageLine[];
  currency: string;
}): string {
  const { wa, storeName, cliente, lines, currency } = opts;
  const productos = lines
    .map(
      (l) =>
        `• ${l.qty}× ${l.name} – ${fmtCurrency(l.qty * l.price, currency)}`,
    )
    .join("\n");
  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
  const text = renderWhatsappMessage(wa.template, {
    cliente,
    tienda: storeName,
    productos,
    total: wa.include_total ? fmtCurrency(total, currency) : "—",
    fecha: fmtDate(new Date()),
  });
  return wa.include_note && wa.note ? `${text}\n\n${wa.note}` : text;
}
