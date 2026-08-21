import { useApp } from "@/contexts/AppContext";

export function useSubscription() {
  const { subscription, subscriptionLoading, refetchSubscription } = useApp();
  return {
    data: subscription ? { subscription } : undefined,
    loading: subscriptionLoading,
    refetch: refetchSubscription,
  };
}

export function usePlanLimit(feature: string): number | undefined {
  const { data } = useSubscription();
  const subscription = data?.subscription;
  const limit = subscription?.plan?.limits?.find(
    (l) => l.feature === feature,
  )?.limit_value;
  if (limit === undefined || limit === -1) return undefined;
  return limit;
}
