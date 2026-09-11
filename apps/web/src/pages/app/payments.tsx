import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Plus,
  Building2,
  Bitcoin,
  Smartphone,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useAccount";
import { paymentService } from "@/services/paymentService";
import type { Payment } from "@/types/models";

const METHOD_ICONS: Record<string, React.ReactNode> = {
  transferencia: <Building2 className="size-5" />,
  pago_movil: <Smartphone className="size-5" />,
  binance: <Bitcoin className="size-5" />,
};

const money = (v: string | number) => `$${Number(v).toFixed(2)}`;
const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export function Component() {
  const { t } = useI18n();
  const { data: subData, loading: subLoading } = useSubscription();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService
      .index()
      .then((res) => setPayments(res.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const subscription = subData?.subscription;
  const next = subscription?.renews_at ?? subscription?.trial_ends_at ?? null;

  const methodLabel = (m: string) =>
    m === "transferencia"
      ? t("pay.transfer")
      : m === "pago_movil"
        ? t("pay.pagoMovil")
        : m === "binance"
          ? t("pay.binance")
          : m;

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/profile"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t("pay.title")}</h1>
      </header>

      <section className="mx-5 p-5 rounded-3xl gradient-brand text-primary-foreground shadow-pop">
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Crown className="size-4" /> {t("pay.plan")}
        </div>
        <p className="font-display font-extrabold text-3xl mt-1">
          {subscription?.plan?.name ?? "—"}
        </p>
        <p className="text-sm opacity-90">
          {money(subscription?.plan?.price ?? 0)} {t("plans.month")}
        </p>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
          <span className="opacity-90">{t("pay.next")}</span>
          <span className="font-semibold">
            {subLoading ? "…" : fmtDate(next)}
          </span>
        </div>
      </section>

      <section className="px-5 mt-6 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">{t("pay.history")}</h2>
          <Link
            to="/pay-suscripcion"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus className="size-3.5" /> {t("pay.report")}
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground rounded-3xl bg-card border border-border">
            {t("pay.empty")}
          </div>
        ) : (
          <ul className="space-y-2">
            {payments.map((p) => {
              const state = p.status;
              return (
                <li
                  key={p.uuid}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
                >
                  <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
                    {METHOD_ICONS[p.method] ?? <Building2 className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {money(p.amount)}
                      <span className="text-xs text-muted-foreground font-normal">
                        {" "}
                        · {p.months ?? 1} {t("paySuscripcion.months")}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {methodLabel(p.method)} · {p.reference ?? "—"} ·{" "}
                      {fmtDate(p.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      state === "approved"
                        ? "bg-success/20 text-success-foreground"
                        : state === "pending"
                          ? "bg-warning/20 text-warning-foreground"
                          : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {state === "approved"
                      ? t("pay.approved")
                      : state === "pending"
                        ? t("pay.pending")
                        : t("pay.rejected")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
