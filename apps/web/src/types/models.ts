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

// Contacto polimórfico (telefono, whatsapp, email) de la tienda/producto/categoría
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

export interface ContactData {
  type: string;
  value: string;
  label?: string;
  is_primary?: boolean;
  position?: number;
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

export interface Country {
  id: number;
  uuid: string;
  name: string;
  iso2: string;
  flag: string | null;
  calling_code: string | null;
  currency_id: number | null;
  status: boolean;
  currency?: Currency | null;
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
  created_at: string;
  updated_at: string;
}

export interface StoreData {
  name: string;
  slug: string;
  description?: string;
  domain?: string;
  currency_id?: number | null;
  currency_secondary_id?: number | null;
  accent_color?: string | null;
  settings?: StoreSettings;
  logo_url?: string;
  banner_url?: string;
  status?: 0 | 1;
}

export interface StoreRef {
  id: number;
  uuid: string;
  name: string;
  slug: string;
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
  store?: StoreRef | null;
  category?: Pick<
    Category,
    "id" | "uuid" | "name" | "icon" | "status"
  > | null;
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface ProductData {
  name: string;
  slug: string;
  description?: string;
  code?: string;
  stock?: number;
  price: number;
  category_id?: number;
  store_id?: number;
  status?: 0 | 1;
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
  products_count?: number;
  subcategories_count?: number;
  parent?: Category | null;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface CategoryData {
  name: string;
  slug: string;
  parent_id?: number;
  icon?: string;
  image_url?: string;
  status?: 0 | 1;
}

export interface Permission {
  id: number;
  name: string;
  key: string;
  scope: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Role {
  id: number;
  uuid: string;
  account_id: number;
  name: string;
  scope: string;
  status: 0 | 1;
  permissions: Permission[];
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RoleData {
  name: string;
  permission_ids?: number[];
}

// UserResource de /users — role_id/status planos (del pivot account_users),
// NO hay campo `pivot` anidado como en el ROADMAP anterior.
export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  active_account_id: number | null;
  is_superadmin: boolean;
  role_id?: number | null;
  status?: number;
  roles?: Role[];
  avatar?: string | null; // display-only: la API no lo envía hoy → fallback a iniciales
  created_at: string;
  updated_at: string;
}

export interface UserData {
  name: string;
  email: string;
  password?: string;
  role_id: number;
  status?: 0 | 1;
}

export interface Account {
  id: number;
  uuid: string;
  name: string;
  legal_name: string | null;
  rif: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  verified: boolean;
  country_info?: Country | null;
  status: number;
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

export interface PlanLimit {
  id: number;
  plan_id: number;
  feature: string;
  limit_value: number;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  interval: string;
  status: number;
  limits?: PlanLimit[];
}

export interface Subscription {
  id: number;
  account_id: number;
  plan_id: number;
  status: number;
  started_at: string | null;
  ends_at: string | null;
  trial_ends_at: string | null;
  plan?: Plan;
}
