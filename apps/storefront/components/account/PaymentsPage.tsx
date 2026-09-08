"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAccountShell } from "@/components/account/AccountShell";
import { CardSkeleton, EmptyState } from "@/components/account/accountUi";
import { fmtCurrency, fmtIsoDate } from "@/lib/format";
import { payState } from "@/lib/orders";
import { fetchPayments } from "@/services/orderService";
import type { Payment } from "@/lib/customerAuth";

export function PaymentsPage() {
  const { t } = useI18n();
  const { accent, primaryCurrency, secondaryCurrency, slug } =
    useAccountShell();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments(slug)
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <h1 className="font-display font-extrabold text-2xl tracking-tight">
        {t("payment.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("payment.subtitle")}</p>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} lines={2} />
          ))
        ) : !payments.length ? (
          <EmptyState icon={Receipt} text={t("payment.empty")} />
        ) : (
          payments.map((p) => {
            const state = payState(p.status);
            const methodKey =
              p.method === "pago_movil"
                ? "payment.method.pago_movil"
                : p.method === "transferencia"
                  ? "payment.method.transferencia"
                  : null;
            const statusKey =
              state === "approved"
                ? "payment.status.approved"
                : state === "rejected"
                  ? "payment.status.rejected"
                  : "payment.status.pending";

            return (
              <Link
                key={p.uuid}
                href={
                  p.order?.uuid
                    ? `/account/orders/${p.order.uuid}`
                    : "/account/orders"
                }
                className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 hover:border-foreground/20 transition"
              >
                <Receipt className="size-5 shrink-0" style={{ color: accent }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {methodKey ? t(methodKey) : p.method} · {t("payment.reference")}{" "}
                    {p.reference}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {fmtIsoDate(p.created_at)} · {p.order?.code ?? ""} ·{" "}
                    {t(statusKey)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold tabular-nums text-sm">
                    {fmtCurrency(Number(p.amount), primaryCurrency)}
                  </p>
                  {secondaryCurrency && (
                    <p className="text-[11px] text-muted-foreground">
                      ≈ {fmtCurrency(Number(p.amount), secondaryCurrency.code)}
                    </p>
                  )}
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
