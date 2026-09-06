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
