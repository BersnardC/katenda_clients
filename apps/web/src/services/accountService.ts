import { api } from "@/lib/api";
import type { User } from "@/types/auth";
import type { Account, AccountStats, Plan, RevenuePoint, Subscription } from "@/types/models";

export const accountService = {
  // GET /account -> { account }
  show: () => api.get<{ account: Account }>("/account"),
  // PUT /account -> { account }
  update: (data: Partial<Account>) =>
    api.put<{ account: Account }>("/account", data),
  // POST /account/switch { account_id } -> { user } (cuenta de operación)
  switch: (accountId: number) =>
    api.post<{ user: User }>("/account/switch", { account_id: accountId }),
  // GET /account/subscription -> { subscription }
  subscription: () =>
    api.get<{ subscription: Subscription }>("/account/subscription"),
  // GET /plans -> { plans }
  plans: () => api.get<{ plans: Plan[] }>("/plans"),
  // POST /account/subscription { plan_id } -> { subscription }
  changePlan: (planId: number) =>
    api.post<{ subscription: Subscription }>("/account/subscription", {
      plan_id: planId,
    }),
  // GET /account/stats?metrics= -> { stats }
  stats: (metrics?: string) =>
    api.get<{ stats: Partial<AccountStats> }>(
      `/account/stats${metrics ? `?metrics=${metrics}` : ""}`,
    ),
  // GET /account/stats/revenue?range= -> { revenue_series }
  statsRevenue: (range: string) =>
    api.get<{ revenue_series: RevenuePoint[] }>(
      `/account/stats/revenue?range=${range}`,
    ),
};
