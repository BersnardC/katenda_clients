import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { accountService } from "@/services/accountService";
import { getToken } from "@/lib/api";
import type { Subscription } from "@/types/models";

interface AppContextType {
  subscription: Subscription | null;
  subscriptionLoading: boolean;
  refetchSubscription: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    accountService
      .subscription()
      .then((res) => {
        if (alive) setSubscription(res.subscription);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setSubscriptionLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const refetchSubscription = useCallback(
    () => setReloadKey((k) => k + 1),
    [],
  );

  return (
    <AppContext.Provider
      value={{ subscription, subscriptionLoading, refetchSubscription }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
