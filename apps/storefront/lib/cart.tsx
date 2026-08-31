"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  qty: number;
}

type CartInput = Omit<CartLine, "qty">;

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (item: CartInput, qty?: number) => void;
  changeQty: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

const STORAGE_KEY = "katenda.cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* cart corrupto → ignorar */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* sin espacio / privado */
    }
  }, [lines, hydrated]);

  const add = (item: CartInput, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      if (found) {
        return prev.map((l) =>
          l.id === item.id ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { ...item, qty }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  };

  const remove = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const clear = () => setLines([]);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.price, 0),
    [lines],
  );

  return (
    <CartContext.Provider
      value={{ lines, count, total, add, changeQty, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
