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
import { useAuth } from "@/contexts/AuthContext";
import type { Account, Subscription } from "@/types/models";

interface AppContextType {
  subscription: Subscription | null;
  subscriptionLoading: boolean;
  refetchSubscription: () => void;
  account: Account | null;
  accountLoading: boolean;
  refetchAccount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [reloadKeyAccount, setReloadKeyAccount] = useState(0);
  const accountId = user?.active_account_id ?? null;

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    accountService
      .subscription()
      .then((res) => {
        if (alive) setSubscription(res.subscription);
      })
      .catch(() => {
        if (alive) setSubscription(null);
      })
      .finally(() => {
        if (alive) setSubscriptionLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey, accountId]);

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    setAccountLoading(true);
    accountService
      .show()
      .then((res) => {
        if (alive) setAccount(res.account);
      })
      .catch(() => {
        if (alive) setAccount(null);
      })
      .finally(() => {
        if (alive) setAccountLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKeyAccount, accountId]);

  const refetchSubscription = useCallback(
    () => setReloadKey((k) => k + 1),
    [],
  );

  const refetchAccount = useCallback(
    () => setReloadKeyAccount((k) => k + 1),
    [],
  );

  return (
    <AppContext.Provider
      value={{
        subscription,
        subscriptionLoading,
        refetchSubscription,
        account,
        accountLoading,
        refetchAccount,
      }}
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
