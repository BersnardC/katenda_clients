import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { accountService } from "@/services/accountService";
import { storeService } from "@/services/storeService";
import { countryService } from "@/services/countryService";
import { currencyService } from "@/services/currencyService";
import { getToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Account, Country, Currency, Store, Subscription } from "@/types/models";

interface AppContextType {
  subscription: Subscription | null;
  subscriptionLoading: boolean;
  refetchSubscription: () => void;
  account: Account | null;
  accountLoading: boolean;
  refetchAccount: () => void;
  stores: Store[];
  storesLoading: boolean;
  refetchStores: () => void;
  countries: Country[];
  countriesLoading: boolean;
  currencies: Currency[];
  currenciesLoading: boolean;
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
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [reloadKeyStores, setReloadKeyStores] = useState(0);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
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

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    storeService
      .list()
      .then((res) => {
        if (alive) setStores(res.data ?? []);
      })
      .catch(() => {
        if (alive) setStores([]);
      })
      .finally(() => {
        if (alive) setStoresLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKeyStores, accountId]);

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    countryService
      .list()
      .then((res) => {
        if (alive) setCountries(res.countries ?? []);
      })
      .catch(() => {
        if (alive) setCountries([]);
      })
      .finally(() => {
        if (alive) setCountriesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    currencyService
      .list()
      .then((res) => {
        if (alive) setCurrencies(res.currencies ?? []);
      })
      .catch(() => {
        if (alive) setCurrencies([]);
      })
      .finally(() => {
        if (alive) setCurrenciesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const refetchSubscription = useCallback(
    () => setReloadKey((k) => k + 1),
    [],
  );

  const refetchAccount = useCallback(
    () => setReloadKeyAccount((k) => k + 1),
    [],
  );

  const refetchStores = useCallback(
    () => setReloadKeyStores((k) => k + 1),
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
        stores,
        storesLoading,
        refetchStores,
        countries,
        countriesLoading,
        currencies,
        currenciesLoading,
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
