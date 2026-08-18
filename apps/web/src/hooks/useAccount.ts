import { useFetch } from "@/hooks/useFetch";
import { accountService } from "@/services/accountService";

export function useSubscription() {
  return useFetch(() => accountService.subscription());
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
