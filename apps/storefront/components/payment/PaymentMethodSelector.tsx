"use client";

import { CreditCard } from "lucide-react";
import type { StorePaymentMethod } from "@/lib/customerAuth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunc = (k: any, vars?: Record<string, string | number>) => string;

export function PaymentMethodSelector({
  methods,
  selected,
  onSelect,
  accent,
  t,
}: {
  methods: StorePaymentMethod[];
  selected: StorePaymentMethod | null;
  onSelect: (m: StorePaymentMethod) => void;
  accent: string;
  t: TFunc;
}) {
  if (methods.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {methods.map((m) => {
        const active = selected?.uuid === m.uuid;
        return (
          <button
            key={m.uuid}
            type="button"
            onClick={() => onSelect(m)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition ${
              active
                ? "border-transparent"
                : "bg-card border-border text-muted-foreground"
            }`}
            style={
              active
                ? {
                    backgroundColor: accent + "1f",
                    color: accent,
                    borderColor: accent,
                  }
                : undefined
            }
          >
            <CreditCard className="size-5" />
            <span className="text-[11px] font-semibold text-center leading-tight">
              {m.label ?? m.payment_method?.name ?? "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
