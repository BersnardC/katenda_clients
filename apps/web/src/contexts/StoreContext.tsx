import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStores } from "@/hooks/useStores";
import { useAuth } from "@/contexts/AuthContext";
import type { Store } from "@/services/storeService";

type StoreCtx = {
  activeStore: Store | undefined;
  selectStore: (uuid: string) => void;
  stores: Store[] | undefined;
  loading: boolean;
};

const Ctx = createContext<StoreCtx>({
  activeStore: undefined,
  selectStore: () => {},
  stores: undefined,
  loading: true,
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: stores, isLoading } = useStores(!!user);
  const [activeUuid, setActiveUuid] = useState<string | null>(() =>
    localStorage.getItem("katenda.active_store"),
  );

  const activeStore = stores?.find((s) => s.uuid === activeUuid) ?? stores?.[0];

  useEffect(() => {
    if (stores?.length && !activeUuid) {
      localStorage.setItem("katenda.active_store", stores[0].uuid);
      setActiveUuid(stores[0].uuid);
    }
  }, [stores, activeUuid]);

  const selectStore = (uuid: string) => {
    localStorage.setItem("katenda.active_store", uuid);
    setActiveUuid(uuid);
  };

  return (
    <Ctx.Provider value={{ activeStore, selectStore, stores, loading: isLoading }}>
      {children}
    </Ctx.Provider>
  );
}

export const useActiveStore = () => useContext(Ctx);
