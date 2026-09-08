"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Check,
  MapPin,
  MessageCircle,
  PartyPopper,
  Printer,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-react";
import { Dialog, DialogContent } from "@katenda_clients/ui/dialog";
import { useI18n, type Key } from "@/lib/i18n";
import { useAccountShell } from "@/components/account/AccountShell";
import { useCustomerAuth } from "@/lib/customerAuth";
import { CardSkeleton } from "@/components/account/accountUi";
import { fmtCurrency, fmtIsoDate } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import {
  ORDER_STATUS_COLORS,
  isPayableOrder,
  orderStatusKey,
  payState,
} from "@/lib/orders";
import { fetchOrder, reportPayment } from "@/services/orderService";
import type { CustomerOrder } from "@/lib/customerAuth";

type TFunc = (k: Key, vars?: Record<string, string | number>) => string;

const inputCls =
  "w-full h-11 px-3 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm";

type Method = "pago_movil" | "transferencia";

export function OrderDetailPage({ orderUuid }: { orderUuid: string }) {
  const { t } = useI18n();
  const { slug, accent, primaryCurrency, secondaryCurrency, store, waPhone } =
    useAccountShell();
  const { customer } = useCustomerAuth();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [method, setMethod] = useState<Method>("pago_movil");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchOrder(slug, orderUuid)
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, orderUuid]);

  if (loading) {
    return (
      <div className="space-y-3">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={3} />
        <CardSkeleton lines={2} />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-muted-foreground">{t("product.notFound")}</p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 px-5 h-11 rounded-2xl text-white font-semibold"
          style={{ backgroundColor: accent }}
        >
          <ArrowLeft className="size-4" /> {t("order.title")}
        </Link>
      </div>
    );
  }

  const statusLabel = t(orderStatusKey(order.status));
  const payment = payState(order.payment?.status);
  const canPay = isPayableOrder(order.status, order.payment?.status);
  const invoiceReady = payment === "approved";

  const report = async (
    e: React.FormEvent,
    m: Method,
    reference: string,
    detail: string,
  ) => {
    e.preventDefault();
    try {
      const res = await reportPayment(slug, order.uuid, {
        method: m,
        reference,
        detail,
      });
      setOrder(res.order);
      setSuccess(true);
      toast.success(t("payment.successSub"));
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "";
      toast.error(message || t("store.orderError"));
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href="/account/orders"
          className="size-9 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("order.title")}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-extrabold text-2xl tracking-tight">
            {order.code}
          </h1>
          <p className="text-xs text-muted-foreground">
            {fmtIsoDate(order.created_at)}
          </p>
        </div>
        <span
          className="px-3 h-7 grid place-items-center rounded-full text-xs font-bold capitalize"
          style={{
            backgroundColor:
              (ORDER_STATUS_COLORS[order.status] ?? "#f59e0b") + "26",
            color: ORDER_STATUS_COLORS[order.status] ?? "#f59e0b",
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Ficha imprimible / factura */}
      <section
        id="factura"
        className="mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft print:shadow-none print:border-0"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display font-extrabold text-lg flex items-center gap-2">
              <Store className="size-4" style={{ color: accent }} /> {store.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoiceReady ? "Factura / Ticket de compra" : "Resumen del pedido"}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{order.code}</p>
            <p>{fmtIsoDate(order.created_at)}</p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {(order.items ?? []).map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span
                className="size-8 rounded-xl grid place-items-center text-xs font-bold"
                style={{ backgroundColor: accent + "26", color: accent }}
              >
                {i.qty}×
              </span>
              <span className="flex-1 truncate">{i.name}</span>
              <span className="text-right tabular-nums">
                {fmtCurrency(Number(i.price) * i.qty, primaryCurrency)}
                {secondaryCurrency && (
                  <span className="block text-[11px] text-muted-foreground">
                    ≈{" "}
                    {fmtCurrency(Number(i.price) * i.qty, secondaryCurrency.code)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-sm">
          <Row
            label={t("product.subtotal")}
            value={fmtCurrency(Number(order.subtotal), primaryCurrency)}
          />
          {Number(order.discount) > 0 && (
            <Row
              label="Descuento"
              value={`- ${fmtCurrency(Number(order.discount), primaryCurrency)}`}
              accent
            />
          )}
          <Row
            label="Envío"
            value={
              Number(order.shipping) > 0
                ? fmtCurrency(Number(order.shipping), primaryCurrency)
                : "Gratis"
            }
          />
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-display font-bold">{t("order.total")}</span>
            <span className="text-right">
              <span
                className="font-display font-extrabold text-2xl"
                style={{ color: accent }}
              >
                {fmtCurrency(Number(order.total), primaryCurrency)}
              </span>
              {secondaryCurrency && (
                <span className="block text-xs text-muted-foreground">
                  ≈ {fmtCurrency(Number(order.total), secondaryCurrency.code)}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border grid gap-1 text-xs text-muted-foreground">
          {customer?.address && customer?.city && (
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {customer.address}, {customer.city}
            </p>
          )}
          {order.payment && (
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />{" "}
              {methodLabel(t, order.payment.method)} · Ref.{" "}
              {order.payment.reference} · {order.payment.detail ?? ""} ·{" "}
              {fmtIsoDate(order.payment.created_at)}
            </p>
          )}
          <p>
            Estado del pago:{" "}
            <b className="text-foreground capitalize">
              {payment === "approved"
                ? t("payment.status.approved")
                : payment === "rejected"
                  ? t("payment.status.rejected")
                  : payment === "pending"
                    ? t("payment.status.pending")
                    : "Sin pagar"}
            </b>
          </p>
        </div>

        {invoiceReady && (
          <button
            onClick={() => window.print()}
            className="mt-4 w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 print:hidden"
            style={{ backgroundColor: accent }}
          >
            <Printer className="size-4" /> Descargar PDF / Imprimir
          </button>
        )}
      </section>

      {/* WhatsApp de la tienda (por si acaso) */}
      {waPhone && (
        <a
          href={whatsappLink(
            waPhone,
            `Hola, quiero consultar sobre mi pedido ${order.code}`,
          )}
          target="_blank"
          rel="noreferrer"
          className="mt-4 w-full h-12 rounded-2xl bg-surface border border-border text-sm font-semibold flex items-center justify-center gap-2 print:hidden"
        >
          <MessageCircle className="size-4" style={{ color: accent }} />{" "}
          {t("order.contactStore")}
        </a>
      )}

      {/* Historial */}
      <section className="mt-4 rounded-3xl bg-card border border-border p-5 shadow-soft print:hidden">
        <h2 className="font-display font-bold">Seguimiento</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(order.events ?? []).map((h) => (
            <li key={h.id} className="flex items-center gap-3">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="flex-1">
                {t(orderStatusKey(h.status))}
                {h.note ? ` · ${h.note}` : ""}
              </span>
              <span className="text-xs text-muted-foreground">
                {fmtIsoDate(h.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Pago */}
      {canPay && (
        <section className="mt-4 print:hidden">
          <h2 className="font-display font-bold text-lg mb-3">
            {t("payment.payOrder")}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <MethodBtn
              icon={<Smartphone className="size-5" />}
              label={t("payment.method.pago_movil")}
              active={method === "pago_movil"}
              onClick={() => setMethod("pago_movil")}
              accent={accent}
            />
            <MethodBtn
              icon={<Building2 className="size-5" />}
              label={t("payment.method.transferencia")}
              active={method === "transferencia"}
              onClick={() => setMethod("transferencia")}
              accent={accent}
            />
          </div>

          <div className="mt-4 rounded-3xl bg-card border border-border p-5 shadow-soft">
            {method === "pago_movil" ? (
              <MovilForm
                total={Number(order.total)}
                onSubmit={report}
                accent={accent}
                t={t}
                primaryCurrency={primaryCurrency}
                secondaryCurrency={secondaryCurrency}
              />
            ) : (
              <TransferForm
                total={Number(order.total)}
                onSubmit={report}
                accent={accent}
                t={t}
                primaryCurrency={primaryCurrency}
                secondaryCurrency={secondaryCurrency}
              />
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-success" /> {t("payment.secure")}
            </p>
          </div>
        </section>
      )}

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="rounded-3xl text-center">
          <div className="size-20 mx-auto rounded-full bg-success/20 grid place-items-center relative">
            <Check className="size-10 text-success-foreground" />
            <PartyPopper className="size-6 text-primary absolute -top-1 -right-1" />
          </div>
          <h2 className="font-display font-extrabold text-2xl mt-4">
            {t("payment.successTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("payment.successSub")}
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-5 w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: accent }}
          >
            <Sparkles className="size-5" /> {t("payment.seeOrder")}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function methodLabel(t: TFunc, method: string): string {
  if (method === "pago_movil") return t("payment.method.pago_movil");
  if (method === "transferencia") return t("payment.method.transferencia");
  return method;
}

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

function MethodBtn({
  icon,
  label,
  active,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition ${
        active ? "border-transparent" : "bg-card border-border text-muted-foreground"
      }`}
      style={
        active
          ? { backgroundColor: accent + "1f", color: accent, borderColor: accent }
          : undefined
      }
    >
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

type ReportFn = (
  e: React.FormEvent,
  m: Method,
  reference: string,
  detail: string,
) => void;

function AmountInfo({
  total,
  primaryCurrency,
  secondaryCurrency,
}: {
  total: number;
  primaryCurrency: string;
  secondaryCurrency: { code: string } | null;
}) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4 text-sm space-y-1">
      <p className="font-semibold">Monto</p>
      <p className="text-muted-foreground">
        {fmtCurrency(total, primaryCurrency)}
        {secondaryCurrency && (
          <span className="text-xs">
            {" "}
            · ≈ {fmtCurrency(total, secondaryCurrency.code)}
          </span>
        )}
      </p>
    </div>
  );
}

function MovilForm({
  total,
  onSubmit,
  accent,
  t,
  primaryCurrency,
  secondaryCurrency,
}: {
  total: number;
  onSubmit: ReportFn;
  accent: string;
  t: TFunc;
  primaryCurrency: string;
  secondaryCurrency: { code: string } | null;
}) {
  const [phone, setPhone] = useState("");
  const [ref, setRef] = useState("");
  return (
    <form
      onSubmit={(e) => onSubmit(e, "pago_movil", ref, phone)}
      className="space-y-3"
    >
      <AmountInfo
        total={total}
        primaryCurrency={primaryCurrency}
        secondaryCurrency={secondaryCurrency}
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t("payment.phone")}
        className={inputCls}
        required
      />
      <input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder={t("payment.reference")}
        inputMode="numeric"
        className={inputCls}
        required
      />
      <SubmitBtn accent={accent} label={t("payment.reportMovil")} />
    </form>
  );
}

function TransferForm({
  total,
  onSubmit,
  accent,
  t,
  primaryCurrency,
  secondaryCurrency,
}: {
  total: number;
  onSubmit: ReportFn;
  accent: string;
  t: TFunc;
  primaryCurrency: string;
  secondaryCurrency: { code: string } | null;
}) {
  const [bank, setBank] = useState("");
  const [ref, setRef] = useState("");
  return (
    <form
      onSubmit={(e) => onSubmit(e, "transferencia", ref, bank)}
      className="space-y-3"
    >
      <AmountInfo
        total={total}
        primaryCurrency={primaryCurrency}
        secondaryCurrency={secondaryCurrency}
      />
      <input
        value={bank}
        onChange={(e) => setBank(e.target.value)}
        placeholder={t("payment.bank")}
        className={inputCls}
        required
      />
      <input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder={t("payment.reference")}
        className={inputCls}
        required
      />
      <SubmitBtn accent={accent} label={t("payment.reportTransfer")} />
    </form>
  );
}

function SubmitBtn({ accent, label }: { accent: string; label: string }) {
  return (
    <button
      type="submit"
      className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
      style={{ backgroundColor: accent }}
    >
      {label}
    </button>
  );
}
