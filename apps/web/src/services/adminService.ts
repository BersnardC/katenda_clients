import { api } from "@/lib/api";
import type { Payment, PaymentGateway, Plan, Promotion } from "@/types/models";
import type { Paginated } from "@/types/pagination";

export interface PaymentGatewayInput {
  code?: string;
  name?: string;
  label?: string | null;
  country_id?: number | null;
  is_manual?: boolean;
  requires_integration?: boolean;
  instructions?: Record<string, unknown> | null;
  report_fields?: Record<string, unknown> | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface PromotionInput {
  plan_id?: number;
  name?: string;
  slug?: string | null;
  description?: string | null;
  months?: number;
  price?: number;
  status?: boolean;
  is_featured?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

export const adminService = {
  // GET /admin/payments -> { data, links, meta }
  payments: (filters?: {
    status?: string;
    method?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (filters?.status && filters.status !== "all")
      qs.set("status", filters.status);
    if (filters?.method) qs.set("method", filters.method);
    if (filters?.search) qs.set("search", filters.search);
    const s = qs.toString();
    return api.get<Paginated<Payment>>(`/admin/payments${s ? `?${s}` : ""}`);
  },
  approve: (uuid: string) =>
    api.post<{ payment: Payment }>(`/admin/payments/${uuid}/approve`),
  reject: (uuid: string) =>
    api.post<{ payment: Payment }>(`/admin/payments/${uuid}/reject`),

  // GET /admin/plans -> { plans }
  plans: () => api.get<{ plans: Plan[] }>("/admin/plans"),

  // Payment gateways CRUD
  paymentGateways: () =>
    api.get<{ payment_gateways: PaymentGateway[] }>("/admin/payment-gateways"),
  createPaymentGateway: (data: PaymentGatewayInput) =>
    api.post<{ payment_gateway: PaymentGateway }>("/admin/payment-gateways", data),
  updatePaymentGateway: (uuid: string, data: PaymentGatewayInput) =>
    api.put<{ payment_gateway: PaymentGateway }>(
      `/admin/payment-gateways/${uuid}`,
      data,
    ),
  deletePaymentGateway: (uuid: string) =>
    api.delete<{ message: string }>(`/admin/payment-gateways/${uuid}`),

  // Promotions CRUD
  promotions: () =>
    api.get<{ promotions: Promotion[] }>("/admin/promotions"),
  createPromotion: (data: PromotionInput) =>
    api.post<{ promotion: Promotion }>("/admin/promotions", data),
  updatePromotion: (uuid: string, data: PromotionInput) =>
    api.put<{ promotion: Promotion }>(`/admin/promotions/${uuid}`, data),
  deletePromotion: (uuid: string) =>
    api.delete<{ message: string }>(`/admin/promotions/${uuid}`),
};
