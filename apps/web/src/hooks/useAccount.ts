import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService, type Account } from "@/services/accountService";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const res = await accountService.show();
      return res.data.account;
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Account>) => accountService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account"] });
      toast.success("Cuenta actualizada correctamente");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al actualizar cuenta";
      console.error("[useUpdateAccount]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await accountService.subscription();
      return res.data.subscription;
    },
    staleTime: Infinity,
    retry: false,
  });
}

export function usePlanLimit(feature: string): number | undefined {
  const { data: subscription } = useSubscription();
  return subscription?.plan?.limits?.find(l => l.feature === feature)?.limit_value;
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await accountService.plans();
      return res.data.plans;
    },
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan_id: number) => accountService.changePlan(plan_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      qc.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan cambiado correctamente");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message || "Error al cambiar plan";
      console.error("[useChangePlan]", msg, err.response?.data);
      toast.error(msg);
    },
  });
}
