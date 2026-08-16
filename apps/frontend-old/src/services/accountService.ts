import api from './api'
import type { Account, Plan, Subscription } from '@/types/models'

export const accountService = {
  show: () => api.get<{ account: Account }>('/account'),
  update: (data: Partial<Account>) =>
    api.put<{ account: Account }>('/account', data),
  subscription: () =>
    api.get<{ subscription: Subscription }>('/account/subscription'),
  plans: () => api.get<{ plans: Plan[] }>('/plans'),
}
