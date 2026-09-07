"use client";

import {
  createContext,
  useCallback,
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
  stock: number;
  qty: number;
}

type CartInput = Omit<CartLine, "qty"> & { qty?: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (item: CartInput) => void;
  changeQty: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Actualiza precio/stock de las líneas según el catálogo vigente. */
  syncFromCatalog: (
    items: Array<{ id: string; price?: number; stock?: number }>,
  ) => void;
};

const CartContext = createContext<CartCtx | null>(null);

const STORAGE_KEY = "katenda.cart";

// Máximo por línea = stock vigente del producto (nunca superar el disponible).
function clampToStock(qty: number, stock: number): number {
  if (stock <= 0) return 0;
  return Math.min(Math.max(1, Math.floor(qty)), stock);
}

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

  const add = (item: CartInput) => {
    if (item.stock <= 0) return;
    const qty = clampToStock(item.qty ?? 1, item.stock);
    if (qty === 0) return;
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      if (found) {
        return prev.map((l) =>
          l.id === item.id
            ? { ...l, qty: clampToStock(l.qty + qty, l.stock) }
            : l,
        );
      }
      return [...prev, { ...item, qty }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.id === id
            ? { ...l, qty: clampToStock(l.qty + delta, l.stock) }
            : l,
        )
        .filter((l) => l.qty > 0),
    );
  };

  const remove = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  // El carrito guarda un snapshot al agregar; si el comercio cambió el precio
  // o el stock, se alinea la línea con el catálogo fresco (sin tocar qty).
  // useCallback: identidad estable para poder usarla en useEffect sin loops.
  const syncFromCatalog = useCallback<CartCtx["syncFromCatalog"]>((items) => {
    setLines((prev) => {
      const byId = new Map(items.map((i) => [i.id, i]));
      let changed = false;
      const next = prev.map((l) => {
        const fresh = byId.get(l.id);
        if (!fresh) return l;
        const price =
          typeof fresh.price === "number" &&
          !Number.isNaN(fresh.price) &&
          fresh.price !== l.price
            ? fresh.price
            : l.price;
        const stock =
          typeof fresh.stock === "number" && fresh.stock >= 0
            ? fresh.stock
            : l.stock;
        if (price === l.price && stock === l.stock) return l;
        changed = true;
        return { ...l, price, stock };
      });
      // Si nada cambió, devolver el mismo array evita renders en cadena.
      return changed ? next : prev;
    });
  }, []);

  const clear = () => setLines([]);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.price, 0),
    [lines],
  );

  return (
    <CartContext.Provider
      value={{ lines, count, total, add, changeQty, remove, clear, syncFromCatalog }}
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
