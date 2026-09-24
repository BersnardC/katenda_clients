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
  onboarded: boolean;
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
  price_per_extra_order?: number | string | null;
  interval: string;
  default_roles?: string[];
  status: number;
  limits?: PlanLimit[];
}

export interface Subscription {
  id: number;
  account_id: number;
  plan_id: number;
  months: number;
  promotion_id: number | null;
  status: number;
  started_at: string | null;
  ends_at: string | null;
  trial_ends_at: string | null;
  renews_at: string | null;
  plan?: Plan;
  promotion?: Promotion | null;
}

export type OrderStatus =
  | "pending"
  | "payment_reported"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderCustomer {
  id: number;
  uuid: string;
  name: string;
  email: string;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  name: string;
  price: string;
  qty: number;
}

export interface OrderEvent {
  id: number;
  status: OrderStatus;
  note: string | null;
  created_at: string | null;
}

export interface Order {
  id: number;
  uuid: string;
  account_id: number;
  store_id: number;
  customer_id: number;
  code: string;
  status: OrderStatus;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  currency_id: number | null;
  payment_method: string | null;
  note: string | null;
  stock_processed: boolean;
  created_at: string;
  updated_at: string;
  store?: { id: number; uuid: string; name: string; slug: string } | null;
  customer?: OrderCustomer | null;
  items?: OrderItem[];
  events?: OrderEvent[];
  payment?: Payment | null;
}

// Cliente de la cuenta (panel del comercio) — GET /customers, GET /customers/{uuid}.
// member_since sale del pivot account_customer; los agregados de pedidos están
// scoped a la cuenta.
export interface Customer {
  id: number;
  uuid: string;
  name: string;
  email: string;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  member_since: string | null;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
  orders?: Order[];
}

// Gateway de pago (catálogo admin: transferencia, pago móvil, binance, etc.)
export interface PaymentGateway {
  id: number;
  uuid: string;
  code: string;
  name: string;
  label: string | null;
  country_id: number | null;
  is_manual: boolean;
  requires_integration: boolean;
  instructions: Record<string, any> | null;
  report_fields: Record<string, any> | null;
  is_active: boolean;
  sort_order: number;
  country?: Country;
  platform_banks?: PlatformBank[];
}

// Institución bancaria / procesador (catálogo admin)
export interface PlatformBank {
  id: number;
  uuid: string;
  name: string;
  code: string;
  country_id: number | null;
  logo_url: string | null;
  type: string;
  extra: Record<string, any> | null;
  is_active: boolean;
  sort_order: number;
}

export interface PaymentMethodField {
  key: string;
  label: string;
  type: "text" | "tel" | "email" | "number" | "select" | "textarea" | "date" | "image";
  required: boolean;
  hidden?: boolean;
  placeholder?: string;
  options?: string[];
  source?: string;
  source_filters?: Record<string, unknown>;
}

// Método de pago configurado por el comercio en su tienda
export interface PaymentMethod {
  id: number;
  uuid: string;
  paymentable_type: string;
  paymentable_id: number;
  account_id: number;
  payment_gateway_id: number;
  platform_bank_id: number | null;
  label: string | null;
  data: Record<string, string> | null;
  note: string | null;
  is_active: boolean;
  sort_order: number;
  payment_gateway?: PaymentGateway;
  created_at: string | null;
  updated_at: string | null;
}

// Promoción / periodo de plan (3 meses por 2, 6 meses, anual...)
export interface Promotion {
  id: number;
  uuid: string;
  plan_id: number;
  name: string;
  slug: string | null;
  description: string | null;
  months: number;
  price: number | string;
  status: boolean;
  is_featured: boolean;
  starts_at: string | null;
  ends_at: string | null;
  plan?: {
    id: number;
    name: string;
    slug: string;
    price: number | string;
    interval: string;
  } | null;
}

// Pago unificado (kind: order | subscription)
export interface Payment {
  id: number;
  uuid: string;
  kind: string;
  method: string;
  reference: string | null;
  detail: string | null;
  amount: string;
  currency_id: number | null;
  status: string;
  payee_type: string;
  promotion_id: number | null;
  paid_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata?: Record<string, unknown> | null;
  plan_name?: string | null;
  months?: number;
  amount_paid?: string | number | null;
  rate?: string | number | null;
  order?: { uuid: string; code: string; status: string } | null;
  subscription?: {
    uuid: string;
    plan_id: number;
    status: number;
    months: number;
    renews_at: string | null;
  } | null;
  promotion?: Promotion | null;
  account?: { id: number; uuid: string; name: string; email: string } | null;
}

// Métricas del panel (GET /account/stats)
export interface RevenuePoint {
  date: string;
  total: number;
}

export interface CategorySale {
  name: string;
  total: number;
  percent: number;
}

export interface LowStockItem {
  uuid: string;
  name: string;
  stock: number;
}

export interface ProductView {
  uuid: string;
  name: string;
  views: number;
}

export interface RecentOrder {
  uuid: string;
  code: string;
  status: string;
  total: string;
  created_at: string | null;
  customer_name: string | null;
}

export interface AccountStats {
  visits_count: number;
  orders_count: number;
  customers_count: number;
  products_count: number;
  revenue: number;
  product_views: ProductView[];
  sales_by_category: CategorySale[];
  low_stock: LowStockItem[];
  recent_orders: RecentOrder[];
}
