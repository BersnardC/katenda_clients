import api from "./api";

export type Account = {
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
  country: string;
  status: number;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: number;
  account_id: number;
  plan_id: number;
  status: number;
  started_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  plan: Plan;
};

export type Plan = {
  id: number;
  name: string;
  slug: string;
  price: string;
  interval: string;
  status: boolean;
  limits: PlanLimit[];
};

export type PlanLimit = {
  id: number;
  plan_id: number;
  feature: string;
  limit_value: number;
};

export const accountService = {
  show: () => api.get<{ account: Account }>("/account"),
  update: (data: Partial<Account>) =>
    api.put<{ account: Account }>("/account", data),
  subscription: () =>
    api.get<{ subscription: Subscription }>("/account/subscription"),
  changePlan: (plan_id: number) =>
    api.post<{ subscription: Subscription }>("/account/subscription", { plan_id }),
  cancelSubscription: () => api.delete("/account/subscription"),
  plans: () => api.get<{ plans: Plan[] }>("/plans"),
};
