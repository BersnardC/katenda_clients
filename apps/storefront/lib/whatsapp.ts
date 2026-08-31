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
