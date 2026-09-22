import { api } from "@/lib/api";
import type { Payment, PaymentGateway, Promotion } from "@/types/models";
import type { Paginated } from "@/types/pagination";

export interface ReportPaymentInput {
  plan_id: number;
  promotion_id?: number | null;
  months?: number;
  method: string;
  reference?: string;
  detail?: string;
  amount_paid?: number;
  rate?: number;
  paid_on?: string;
}

export const paymentService = {
  // GET /account/payments -> { data, links, meta }
  index: (status?: string) =>
    api.get<Paginated<Payment>>(
      `/account/payments${status && status !== "all" ? `?status=${status}` : ""}`,
    ),
  // POST /account/payments -> { payment }
  report: (data: ReportPaymentInput) =>
    api.post<{ payment: Payment }>("/account/payments", data),
  // GET /promotions -> { promotions }
  promotions: () => api.get<{ promotions: Promotion[] }>("/promotions"),
  // GET /payment-gateways -> { payment_gateways }
  paymentMethods: () =>
    api.get<{ payment_gateways: PaymentGateway[] }>("/payment-gateways"),
};
