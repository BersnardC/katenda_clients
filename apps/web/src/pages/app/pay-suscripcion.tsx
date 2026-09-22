import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  CreditCard,
  Building2,
  Smartphone,
  Bitcoin,
  Tag,
  Calendar,
  CalendarCheck,
  Loader2,
  Check,
  ShieldCheck,
  Upload,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@katenda_clients/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useAccount";
import { accountService } from "@/services/accountService";
import { paymentService } from "@/services/paymentService";
import type { PaymentGateway, Plan, Promotion } from "@/types/models";

const BS_RATE = 805;

const METHOD_ICONS: Record<string, React.ReactNode> = {
  transferencia: <Building2 className="size-5" />,
  pago_movil: <Smartphone className="size-5" />,
  binance: <Bitcoin className="size-5" />,
};

const num = (v: number | string) => Number(v);
const money = (v: number | string) => `$${num(v).toFixed(2)}`;
const bs = (usd: number) =>
  (usd * BS_RATE).toLocaleString("es-VE", { maximumFractionDigits: 2 });
const fmtDate = (d: Date) =>
  d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const { data: subData, refetch: refetchSubscription } = useSubscription();
  const [params] = useSearchParams();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [methods, setMethods] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null,
  );
  const [method, setMethod] = useState("");

  const [form, setForm] = useState({
    first: "",
    reference: "",
    date: "",
    amountBs: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ until: string } | null>(null);

  const currentPlanIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    currentPlanIdRef.current = subData?.subscription?.plan_id;
  }, [subData]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      accountService.plans(),
      paymentService.promotions(),
      paymentService.paymentMethods(),
    ])
      .then(([planRes, promoRes, methodRes]) => {
        if (!alive) return;
        const activePlans = planRes.plans.filter((p) => Number(p.status) === 1);
        setPlans(activePlans);
        setPromotions(promoRes.promotions);
        setMethods(methodRes.payment_gateways);
        setMethod((prev) => prev || methodRes.payment_gateways[0]?.code || "");

        const paramPlan = params.get("plan");
        const fromParam = paramPlan
          ? activePlans.find((x) => x.slug === paramPlan)
          : undefined;
        const initial =
          fromParam ??
          activePlans.find((x) => x.id === currentPlanIdRef.current) ??
          activePlans[0];

        if (initial) setSelectedPlanId(initial.id);

        const promoParam = params.get("promotion");
        if (promoParam) setSelectedPromotionId(Number(promoParam));
      })
      .catch(() => {
        if (alive) toast.error(t("paySuscripcion.loadError"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [t, params]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const planPromotions = useMemo(
    () =>
      promotions
        .filter((p) => p.plan_id === selectedPlanId)
        .sort((a, b) => num(a.months) - num(b.months)),
    [promotions, selectedPlanId],
  );

  const selectedPromotion = useMemo(
    () => planPromotions.find((p) => p.id === selectedPromotionId) ?? null,
    [planPromotions, selectedPromotionId],
  );

  const months = selectedPromotion ? num(selectedPromotion.months) : 1;
  const regular = selectedPlan ? num(selectedPlan.price) * months : 0;
  const total = selectedPromotion ? num(selectedPromotion.price) : regular;
  const discount = regular - total;

  const endDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d;
  }, [months]);

  const selectPlan = (id: number) => {
    setSelectedPlanId(id);
    setSelectedPromotionId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || submitting) return;

    setSubmitting(true);
    try {
      await paymentService.report({
        plan_id: selectedPlan.id,
        promotion_id: selectedPromotion?.id ?? null,
        months,
        method,
        reference: method === "binance" ? form.first : form.reference,
        detail: method === "binance" ? undefined : form.first || undefined,
        amount_paid:
          method === "binance" ? undefined : Number(form.amountBs) || undefined,
        rate: method === "binance" ? undefined : BS_RATE,
        paid_on: form.date || undefined,
      });
      refetchSubscription();
      setSuccess({ until: fmtDate(endDate) });
    } catch (e) {
      toast.error(errMsg(e, t("paySuscripcion.reportError")));
    } finally {
      setSubmitting(false);
    }
  };

  const currentMethod = methods.find((m) => m.code === method);

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
          <h1 className="font-display font-bold text-2xl">
            {t("paySuscripcion.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("paySuscripcion.sub")}
          </p>
        </div>
      </header>

      {loading ? (
        <div className="px-5 mt-4 space-y-4">
          <div className="h-24 rounded-3xl bg-muted animate-pulse" />
          <div className="h-32 rounded-3xl bg-muted animate-pulse" />
          <div className="h-64 rounded-3xl bg-muted animate-pulse" />
        </div>
      ) : (
        <>
          {/* Selección de plan y periodo */}
          <section className="px-5 mt-4">
            <h2 className="font-display font-bold text-lg mb-3">
              {t("paySuscripcion.plan")}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((plan) => (
                <PlanBtn
                  key={plan.id}
                  label={plan.name}
                  active={plan.id === selectedPlanId}
                  onClick={() => selectPlan(plan.id)}
                />
              ))}
            </div>

            <h2 className="font-display font-bold text-lg mt-5 mb-3">
              {t("paySuscripcion.period")}
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <PeriodBtn
                label={t("paySuscripcion.month1")}
                active={selectedPromotionId === null}
                onClick={() => setSelectedPromotionId(null)}
              />
              {planPromotions.map((promo) => (
                <PeriodBtn
                  key={promo.id}
                  label={`${promo.months} ${t("paySuscripcion.months")}`}
                  sub={promo.name}
                  featured={promo.is_featured}
                  active={selectedPromotionId === promo.id}
                  onClick={() => setSelectedPromotionId(promo.id)}
                />
              ))}
            </div>
          </section>

          {/* Resumen de la suscripción */}
          <section className="mx-5 mt-5 rounded-3xl gradient-brand text-primary-foreground p-5 shadow-pop">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Crown className="size-4" /> {t("pay.plan")}
              </div>
              {selectedPromotion && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag className="size-3" />
                  {t("paySuscripcion.promo")}
                </span>
              )}
            </div>
            <p className="font-display font-extrabold text-3xl mt-1">
              {selectedPlan?.name}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
                <p className="flex items-center gap-1.5 opacity-80 text-xs">
                  <Calendar className="size-3.5" /> {t("paySuscripcion.start")}
                </p>
                <p className="font-semibold mt-0.5">{fmtDate(new Date())}</p>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
                <p className="flex items-center gap-1.5 opacity-80 text-xs">
                  <CalendarCheck className="size-3.5" />{" "}
                  {t("paySuscripcion.due")}
                </p>
                <p className="font-semibold mt-0.5">{fmtDate(endDate)}</p>
              </div>
            </div>
          </section>

          {/* Detalle de montos */}
          <section className="mx-5 mt-4 rounded-3xl bg-card border border-border p-5 shadow-soft">
            <h2 className="font-display font-bold">
              {t("paySuscripcion.summary")}
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <Row
                label={
                  selectedPromotion
                    ? `${selectedPlan?.name} (${months} ${t("paySuscripcion.months")})`
                    : `${selectedPlan?.name} (${t("paySuscripcion.monthly")})`
                }
                value={money(regular)}
              />
              {discount > 0 && (
                <Row
                  label={t("paySuscripcion.discount")}
                  value={`- ${money(discount)}`}
                  accent
                />
              )}
              <div className="border-t border-border pt-3 mt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("paySuscripcion.total")}</span>
                  <span className="font-display font-extrabold text-2xl text-primary">
                    {money(total)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {t("paySuscripcion.bs").replace(
                      "{rate}",
                      String(BS_RATE),
                    )}
                  </span>
                  <span className="font-semibold">Bs {bs(total)}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-success" />{" "}
              {t("paySuscripcion.secure")}
            </p>
          </section>

          {/* Métodos */}
          <section className="px-5 mt-5 mb-2">
            <h2 className="font-display font-bold text-lg mb-3">
              {t("paySuscripcion.method")}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <MethodBtn
                  key={m.code}
                  icon={METHOD_ICONS[m.code] ?? <CreditCard className="size-5" />}
                  label={m.name}
                  active={method === m.code}
                  onClick={() => setMethod(m.code)}
                />
              ))}
            </div>

            <div className="mt-4 rounded-3xl bg-card border border-border p-5 shadow-soft">
              {method === "transferencia" && (
                <form onSubmit={submit} className="space-y-3">
                  <InstructionsBox
                    lines={[
                      `${currentMethod?.instructions?.bank ?? ""} · ${currentMethod?.instructions?.account ?? ""}`,
                      `${currentMethod?.instructions?.holder ?? ""} · RIF ${currentMethod?.instructions?.rif ?? ""}`,
                      `${t("pay.amount")}: Bs ${bs(total)}`,
                    ]}
                  />
                  <input
                    placeholder={t("paySuscripcion.bankFrom")}
                    className={inputCls}
                    required
                    value={form.first}
                    onChange={(e) => setForm({ ...form, first: e.target.value })}
                  />
                  <input
                    placeholder={t("paySuscripcion.reference")}
                    className={inputCls}
                    required
                    value={form.reference}
                    onChange={(e) =>
                      setForm({ ...form, reference: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t("paySuscripcion.amountBs")}
                      className={inputCls}
                      required
                      value={form.amountBs}
                      onChange={(e) =>
                        setForm({ ...form, amountBs: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(t("paySuscripcion.receiptSoon"))
                    }
                    className="w-full h-11 rounded-xl bg-muted text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Upload className="size-4" /> {t("paySuscripcion.upload")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-2xl gradient-brand text-primary-foreground font-semibold disabled:opacity-70"
                  >
                    {t("pay.report")}
                  </button>
                </form>
              )}

              {method === "pago_movil" && (
                <form onSubmit={submit} className="space-y-3">
                  <InstructionsBox
                    lines={[
                      `${currentMethod?.instructions?.bank ?? ""}`,
                      `${t("paySuscripcion.phone")}: ${currentMethod?.instructions?.phone ?? ""} · RIF ${currentMethod?.instructions?.rif ?? ""}`,
                      `${t("pay.amount")}: Bs ${bs(total)}`,
                    ]}
                  />
                  <input
                    type="tel"
                    placeholder={t("paySuscripcion.phonePlaceholder")}
                    inputMode="tel"
                    className={inputCls}
                    required
                    value={form.first}
                    onChange={(e) => setForm({ ...form, first: e.target.value })}
                  />
                  <input
                    placeholder={t("paySuscripcion.reference")}
                    inputMode="numeric"
                    className={inputCls}
                    required
                    value={form.reference}
                    onChange={(e) =>
                      setForm({ ...form, reference: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t("paySuscripcion.amountBs")}
                      className={inputCls}
                      required
                      value={form.amountBs}
                      onChange={(e) =>
                        setForm({ ...form, amountBs: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-2xl gradient-brand text-primary-foreground font-semibold disabled:opacity-70"
                  >
                    {t("paySuscripcion.reportMobile")}
                  </button>
                </form>
              )}

              {method === "binance" && (
                <form onSubmit={submit} className="space-y-3">
                  <div className="rounded-2xl bg-surface border border-border p-4 text-center">
                    <div className="size-32 mx-auto rounded-xl bg-foreground/90 grid place-items-center text-background text-[10px] font-mono">
                      ▣▣▣▣▣<br />▣ ◫ ▣<br />▣▣▣▣▣
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {currentMethod?.instructions?.currency ?? "USDT"} (
                      {currentMethod?.instructions?.network ?? "BEP20"})
                    </p>
                    <p className="text-[11px] font-mono break-all mt-1">
                      {currentMethod?.instructions?.address ?? ""}
                    </p>
                  </div>
                  <input
                    placeholder={t("paySuscripcion.hash")}
                    className={inputCls}
                    required
                    value={form.first}
                    onChange={(e) => setForm({ ...form, first: e.target.value })}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-2xl gradient-brand text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        {t("paySuscripcion.processing")}
                      </>
                    ) : (
                      t("pay.send")
                    )}
                  </button>
                </form>
              )}
            </div>
          </section>
        </>
      )}

      {/* Celebración */}
      <Dialog open={!!success} onOpenChange={(o) => !o && setSuccess(null)}>
        <DialogContent className="rounded-3xl text-center max-w-sm">
          <div className="size-20 mx-auto rounded-full bg-success/20 grid place-items-center relative">
            <Check className="size-10 text-success-foreground" />
            <PartyPopper className="size-6 text-primary absolute -top-1 -right-1" />
          </div>
          <h2 className="font-display font-extrabold text-2xl mt-4">
            {t("paySuscripcion.successTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("paySuscripcion.successSub").replace(
              "{date}",
              success?.until ?? "",
            )}
          </p>
          <Link
            to="/dashboard"
            className="mt-5 w-full py-3.5 rounded-2xl gradient-brand text-primary-foreground font-semibold flex items-center justify-center gap-2"
          >
            <Sparkles className="size-5" /> {t("paySuscripcion.continue")}
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}

const inputCls =
  "w-full h-11 px-3 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm";

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-success" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

function PlanBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-3 rounded-2xl border transition text-sm font-semibold ${
        active
          ? "bg-primary/15 border-primary text-primary"
          : "bg-card border-border text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function PeriodBtn({
  label,
  sub,
  featured,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  featured?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 min-w-[92px] p-3 rounded-2xl border transition text-left ${
        active
          ? "bg-primary/15 border-primary text-primary"
          : "bg-card border-border text-muted-foreground"
      }`}
    >
      <span className="flex items-center gap-1 text-sm font-semibold">
        {label}
        {featured && <Tag className="size-3" />}
      </span>
      {sub && <span className="block text-[10px] truncate max-w-[100px]">{sub}</span>}
    </button>
  );
}

function MethodBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition ${
        active
          ? "bg-primary/15 border-primary text-primary"
          : "bg-card border-border text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

function InstructionsBox({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4 text-sm space-y-1">
      {lines.map((line, i) => (
        <p key={i} className={i === lines.length - 1 ? "font-semibold mt-1" : "text-muted-foreground"}>
          {line}
        </p>
      ))}
    </div>
  );
}
