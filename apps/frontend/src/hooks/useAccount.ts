import { useQuery } from '@tanstack/react-query'
import { accountService } from '@/services/accountService'

export function useAccount() {
  return useQuery({
    queryKey: ['account'],
    queryFn: async () => {
      const res = await accountService.show()
      return res.data.account
    },
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await accountService.subscription()
      return res.data.subscription
    },
    staleTime: Infinity,
    retry: false,
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await accountService.plans()
      return res.data.plans
    },
  })
}
