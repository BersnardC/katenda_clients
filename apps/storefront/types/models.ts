export interface Media {
  id: number;
  uuid: string;
  model_type: string;
  model_id: number;
  url: string;
  type: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// Configuración de WhatsApp de la tienda (columna `store.settings`)
export interface WhatsappSettings {
  template: string;
  include_photo: boolean;
  include_total: boolean;
  include_note: boolean;
  note: string;
}

export interface StoreSettings {
  whatsapp?: WhatsappSettings;
}

// Contacto polimórfico (telefono, whatsapp, email) — el nº WhatsApp vive aquí
export interface Contact {
  id: number;
  uuid: string;
  contactable_type: string;
  contactable_id: number;
  type: string;
  value: string;
  label: string | null;
  is_primary: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  id: number;
  uuid: string;
  code: string;
  name: string;
  symbol: string | null;
  decimal_places: number;
  status: boolean;
}

export interface Store {
  id: number;
  uuid: string;
  account_id: number;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  currency_id: number | null;
  currency_secondary_id: number | null;
  accent_color: string | null;
  settings?: StoreSettings | null;
  logo_url: string | null;
  banner_url: string | null;
  status: number;
  currency?: Currency | null;
  currency_secondary?: Currency | null;
  media?: Media[];
  contacts?: Contact[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  uuid: string;
  account_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  icon: string | null;
  image_url: string | null;
  status: number;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  uuid: string;
  account_id: number;
  store_id: number;
  name: string;
  slug: string;
  description: string | null;
  code: string | null;
  stock: number;
  price: string;
  category_id: number | null;
  status: number;
  store?: { id: number; uuid: string; name: string; slug: string } | null;
  category?: Pick<Category, "id" | "uuid" | "name" | "icon" | "status"> | null;
  media?: Media[];
  created_at: string;
  updated_at: string;
}

// Datos públicos de empresa expuestos por GET /s/{slug} -> { store, account }
export interface StorefrontAccount {
  name: string;
  legal_name: string | null;
  rif: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  verified: boolean;
  country_info: Country | null;
}

export interface Storefront {
  store: Store;
  account: StorefrontAccount | null;
}

export interface Country {
  id: number;
  uuid: string;
  name: string;
  iso2: string;
  flag: string | null;
  calling_code: string | null;
  currency_id: number | null;
  status: boolean;
}
