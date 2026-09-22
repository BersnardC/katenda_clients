"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clientApi,
  getCustomerToken,
  setCustomerToken,
} from "@/lib/clientApi";

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
  delivery_notes: string | null;
  status: number;
}

export interface PaymentMethodField {
  key: string;
  label: string;
  type: "text" | "tel" | "email" | "number" | "select" | "textarea" | "date" | "image";
  required: boolean;
  placeholder?: string;
  options?: string[];
  source?: string;
  source_filters?: Record<string, unknown>;
}

export interface StorePaymentMethod {
  id: number;
  uuid: string;
  store_id: number;
  payment_method_id: number;
  label: string | null;
  data: Record<string, string> | null;
  hint: string | null;
  is_active: boolean;
  sort_order: number;
  payment_method?: {
    id: number;
    uuid: string;
    code: string;
    name: string;
    label: string | null;
    instructions: Record<string, unknown> | null;
    report_fields: Record<string, unknown> | null;
    is_active: boolean;
    sort_order: number;
  };
  created_at: string | null;
  updated_at: string | null;
}

export interface Payment {
  id: number;
  uuid: string;
  method: string;
  payment_method_id: number | null;
  reference: string | null;
  detail: string | null;
  report_data: Record<string, unknown> | null;
  amount: string;
  currency_id: number | null;
  status: string;
  payee_type: string;
  created_at: string | null;
  order?: { uuid: string; code: string; status: string } | null;
}

export interface CustomerOrderItem {
  id: number;
  product_id: number | null;
  name: string;
  price: string;
  qty: number;
}

export interface CustomerOrderEvent {
  id: number;
  status: string;
  note: string | null;
  created_at: string | null;
}

export interface CustomerOrder {
  id: number;
  uuid: string;
  code: string;
  status: string;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  created_at: string;
  payment_method?: string | null;
  rejections_count: number;
  items?: CustomerOrderItem[];
  events?: CustomerOrderEvent[];
  payment?: Payment | null;
}

const CUSTOMER_KEY = "katenda.customer_user";

type AuthResponse = { customer: Customer; token: string };

export type CustomerProfilePatch = {
  name?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  delivery_notes?: string;
};

type Ctx = {
  customer: Customer | null;
  loading: boolean;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    whatsapp: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: CustomerProfilePatch) => Promise<void>;
};

const CustomerAuthContext = createContext<Ctx | null>(null);

function readStoredCustomer(): Customer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? (JSON.parse(raw) as Customer) : null;
  } catch {
    return null;
  }
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Hidrata desde localStorage sin bloquear el primer render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomer(readStoredCustomer());
    setLoading(false);
  }, []);

  const persist = (c: Customer | null, token: string | null) => {
    setCustomer(c);
    if (c && token) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c));
    else localStorage.removeItem(CUSTOMER_KEY);
    setCustomerToken(token);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    whatsapp: string;
  }) => {
    const res = await clientApi.post<AuthResponse>("/auth/customer/register", data);
    persist(res.customer, res.token);
  };

  const login = async (email: string, password: string) => {
    const res = await clientApi.post<AuthResponse>("/auth/customer/login", {
      email,
      password,
    });
    persist(res.customer, res.token);
  };

  const logout = async () => {
    try {
      if (getCustomerToken()) {
        await clientApi.post("/auth/customer/logout");
      }
    } catch {
      // el token local se limpia igualmente
    }
    persist(null, null);
  };

  const refresh = async () => {
    if (!getCustomerToken()) return;
    try {
      const res = await clientApi.get<{ customer: Customer }>(
        "/auth/customer/me",
      );
      persist(res.customer, getCustomerToken());
    } catch {
      persist(null, null);
    }
  };

  const updateProfile = async (patch: CustomerProfilePatch) => {
    const res = await clientApi.put<{ customer: Customer }>(
      "/auth/customer/me",
      patch,
    );
    persist(res.customer, getCustomerToken());
  };

  const value = useMemo(
    () => ({
      customer,
      loading,
      register,
      login,
      logout,
      refresh,
      updateProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customer, loading],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used inside provider");
  return ctx;
}
