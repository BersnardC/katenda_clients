"use client";

import { clientApi } from "@/lib/clientApi";
import type { CustomerOrder } from "@/lib/customerAuth";

export interface OrderItemInput {
  product_uuid: string;
  qty: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  note?: string;
}

export async function createOrder(
  slug: string,
  input: CreateOrderInput,
): Promise<CustomerOrder> {
  const res = await clientApi.post<{ order: CustomerOrder }>(
    `/s/${slug}/orders`,
    input,
  );
  return res.order;
}

export async function fetchMyOrders(slug: string): Promise<CustomerOrder[]> {
  const res = await clientApi.get<{ data: CustomerOrder[] }>(
    `/s/${slug}/orders/mine`,
  );
  return res.data ?? [];
}

// Cache local de pedidos del cliente (por tienda): primer pintado instantáneo
// en /cuenta. El fetch real sigue haciéndose en cada entrada y refresca el
// caché en segundo plano (mismo nº de requests; solo cambia el UX).
const ORDERS_CACHE_PREFIX = "katenda.orders:";

export function readCachedOrders(slug: string): CustomerOrder[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${ORDERS_CACHE_PREFIX}${slug}`);
    return raw ? (JSON.parse(raw) as CustomerOrder[]) : null;
  } catch {
    return null;
  }
}

export function saveCachedOrders(slug: string, orders: CustomerOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${ORDERS_CACHE_PREFIX}${slug}`,
      JSON.stringify(orders),
    );
  } catch {
    /* sin espacio / modo privado */
  }
}

export function clearCachedOrders(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${ORDERS_CACHE_PREFIX}${slug}`);
  } catch {
    /* noop */
  }
}
