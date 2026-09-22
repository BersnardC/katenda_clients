import { api } from "@/lib/api";
import type { PaymentGateway, PaymentMethod } from "@/types/models";
import type { Paginated } from "@/types/pagination";

export interface PaymentMethodInput {
  paymentable_type: string;
  paymentable_id: number;
  payment_gateway_id: number;
  label?: string | null;
  data?: Record<string, string> | null;
  note?: string | null;
  sort_order?: number;
}

export const storePaymentMethodService = {
  index: (storeUuid?: string) => {
    const params = storeUuid ? `?per_page=50` : "";
    return api.get<Paginated<PaymentMethod>>(
      `/payment-methods${params}`,
    );
  },

  store: (data: PaymentMethodInput) =>
    api.post<{ data: PaymentMethod }>(
      "/payment-methods",
      data,
    ),

  update: (uuid: string, data: Partial<PaymentMethodInput>) =>
    api.put<{ data: PaymentMethod }>(
      `/payment-methods/${uuid}`,
      data,
    ),

  destroy: (uuid: string) =>
    api.delete<{ message: string }>(
      `/payment-methods/${uuid}`,
    ),

  activate: (uuid: string) =>
    api.post<{ message: string }>(
      `/payment-methods/${uuid}/activate`,
    ),

  deactivate: (uuid: string) =>
    api.post<{ message: string }>(
      `/payment-methods/${uuid}/deactivate`,
    ),

  globalMethods: () =>
    api.get<{ payment_gateways: PaymentGateway[] }>("/payment-gateways"),
};
