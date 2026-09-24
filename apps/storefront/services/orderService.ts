"use client";

import { clientApi } from "@/lib/clientApi";
import type {
  CustomerOrder,
  Payment,
  StorePaymentMethod,
} from "@/lib/customerAuth";

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

export async function fetchOrder(
  slug: string,
  uuid: string,
): Promise<CustomerOrder> {
  const res = await clientApi.get<{ order: CustomerOrder }>(
    `/s/${slug}/orders/${uuid}`,
  );
  return res.order;
}

export interface OrderStatusPayload {
  status: string;
  payment_status: string | null;
  rejections_count: number;
}

export async function fetchOrderStatus(
  slug: string,
  uuid: string,
): Promise<OrderStatusPayload> {
  return clientApi.get<OrderStatusPayload>(
    `/s/${slug}/orders/${uuid}/status`,
  );
}

export interface ReportPaymentInput {
  payment_method_id: number;
  report_data: Record<string, string>;
  reference?: string;
  detail?: string;
}

export async function reportPayment(
  slug: string,
  uuid: string,
  input: ReportPaymentInput,
): Promise<{ payment: Payment; order: CustomerOrder }> {
  return clientApi.post(`/s/${slug}/orders/${uuid}/payments`, input);
}

/** Sube comprobante a storage → devuelve URL para report_data. */
export async function uploadPaymentReceipt(
  slug: string,
  orderUuid: string,
  file: File,
): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("images[]", file);
  return clientApi.postForm<{ url: string }>(
    `/s/${slug}/orders/${orderUuid}/payment-receipt`,
    fd,
  );
}

export async function markOrderReceived(
  slug: string,
  uuid: string,
): Promise<CustomerOrder> {
  const res = await clientApi.post<{ order: CustomerOrder }>(
    `/s/${slug}/orders/${uuid}/receive`,
  );
  return res.order;
}

export async function fetchPayments(slug: string): Promise<Payment[]> {
  const res = await clientApi.get<{ data: Payment[] }>(
    `/s/${slug}/payments`,
  );
  return res.data ?? [];
}

export async function fetchPaymentMethods(
  slug: string,
): Promise<StorePaymentMethod[]> {
  const res = await clientApi.get<{ data: StorePaymentMethod[] }>(
    `/s/${slug}/payment-methods`,
  );
  return res.data ?? [];
}

// Cache local de pedidos del cliente (por tienda): primer pintado instantáneo
// en /account. El fetch real sigue haciéndose en cada entrada y refresca el
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
