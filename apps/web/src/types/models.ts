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

export interface Store {
  id: number;
  uuid: string;
  account_id: number;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface StoreData {
  name: string;
  slug: string;
  description?: string;
  domain?: string;
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
  status: number;
  created_at: string;
  updated_at: string;
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
  price: string;
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
