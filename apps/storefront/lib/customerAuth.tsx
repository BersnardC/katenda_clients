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
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  delivery_notes: string | null;
  status: number;
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
  total: string;
  created_at: string;
  items?: CustomerOrderItem[];
  events?: CustomerOrderEvent[];
}

const CUSTOMER_KEY = "katenda.customer_user";

type AuthResponse = { customer: Customer; token: string };

type Ctx = {
  customer: Customer | null;
  loading: boolean;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
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

  const value = useMemo(
    () => ({ customer, loading, register, login, logout, refresh }),
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
