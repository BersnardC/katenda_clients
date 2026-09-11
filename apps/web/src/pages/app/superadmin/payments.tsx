import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  Building2,
  Bitcoin,
  Smartphone,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { adminService } from "@/services/adminService";
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
const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);

  const load = (nextStatus: string) => {
    adminService
      .payments({ status: nextStatus })
      .then((res) => setPayments(res.data))
      .catch((e) => toast.error(errMsg(e, t("sa.loadError"))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const changeStatus = (s: string) => {
    setLoading(true);
    setStatus(s);
  };

  const act = async (uuid: string, action: "approve" | "reject") => {
    if (busy) return;
    setBusy(uuid);
    try {
      if (action === "approve") {
        await adminService.approve(uuid);
        toast.success(t("sa.approved"));
      } else {
        await adminService.reject(uuid);
        toast.success(t("sa.rejected"));
      }
      load(status);
    } catch (e) {
      toast.error(errMsg(e, t("sa.actionError")));
    } finally {
      setBusy(null);
    }
  };

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
          to="/dashboard"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl">{t("sa.payments")}</h1>
          <p className="text-sm text-muted-foreground">{t("sa.paymentsSub")}</p>
        </div>
      </header>

      <div className="px-5 mt-3 flex gap-2 overflow-x-auto">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
              status === s
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {s === "all"
              ? t("sa.filterAll")
              : s === "pending"
                ? t("pay.pending")
                : s === "approved"
                  ? t("pay.approved")
                  : t("pay.rejected")}
          </button>
        ))}
      </div>

      <section className="px-5 mt-4 mb-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground rounded-3xl bg-card border border-border">
            {t("sa.empty")}
          </div>
        ) : (
          <ul className="space-y-2">
            {payments.map((p) => (
              <li
                key={p.uuid}
                className="p-3 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
                    {METHOD_ICONS[p.method] ?? <Building2 className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {p.account?.name ?? "—"} · {p.plan_name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {money(p.amount)} · {methodLabel(p.method)} ·{" "}
                      {p.reference ?? "—"} · {fmtDate(p.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "approved"
                        ? "bg-success/20 text-success-foreground"
                        : p.status === "pending"
                          ? "bg-warning/20 text-warning-foreground"
                          : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {p.status === "approved"
                      ? t("pay.approved")
                      : p.status === "pending"
                        ? t("pay.pending")
                        : t("pay.rejected")}
                  </span>
                </div>

                {p.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={busy === p.uuid}
                      onClick={() => act(p.uuid, "approve")}
                      className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      {busy === p.uuid ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      {t("sa.approve")}
                    </button>
                    <button
                      type="button"
                      disabled={busy === p.uuid}
                      onClick={() => act(p.uuid, "reject")}
                      className="flex-1 h-10 rounded-xl bg-destructive/15 text-destructive text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      {busy === p.uuid ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <X className="size-4" />
                      )}
                      {t("sa.reject")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
