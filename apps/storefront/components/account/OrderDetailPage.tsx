"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  PartyPopper,
  Printer,
  ShieldCheck,
  Sparkles,
  Store,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent } from "@katenda_clients/ui/dialog";
import { useI18n, type Key } from "@/lib/i18n";
import { useAccountShell } from "@/components/account/AccountShell";
import { useCustomerAuth } from "@/lib/customerAuth";
import { CardSkeleton } from "@/components/account/accountUi";
import { fmtCurrency, fmtIsoDate } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import {
  canDownloadOrder,
  canMarkReceived,
  isPayableOrder,
  isPollableOrder,
  ORDER_STATUS_COLORS,
  orderStatusKey,
  payState,
} from "@/lib/orders";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { compressImage } from "@/lib/image";
import {
  fetchOrder,
  fetchOrderStatus,
  fetchPaymentMethods,
  markOrderReceived,
  reportPayment,
  uploadPaymentReceipt,
} from "@/services/orderService";
import type { CustomerOrder, StorePaymentMethod } from "@/lib/customerAuth";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { PaymentReportForm } from "@/components/payment/PaymentReportForm";

type TFunc = (k: Key, vars?: Record<string, string | number>) => string;

export function OrderDetailPage({ orderUuid }: { orderUuid: string }) {
  const { t } = useI18n();
  const { slug, accent, primaryCurrency, secondaryCurrency, store, waPhone } =
    useAccountShell();
  const { customer } = useCustomerAuth();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<StorePaymentMethod | null>(null);
  const [storePaymentMethods, setStorePaymentMethods] = useState<StorePaymentMethod[]>([]);
  const [methodsLoaded, setMethodsLoaded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [reporting, setReporting] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    fetchOrder(slug, orderUuid)
      .then((o) => {
        setOrder(o);
        prevStatusRef.current = o.status;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    fetchPaymentMethods(slug)
      .then((methods) => {
        setStorePaymentMethods(methods);
        if (methods.length > 0) setSelectedMethod(methods[0]);
      })
      .catch(() => {})
      .finally(() => setMethodsLoaded(true));
  }, [slug, orderUuid]);

  // Scroll suave a la sección de pago cuando se navega con #pay.
  useEffect(() => {
    if (!loading && order && window.location.hash === "#pay") {
      const el = document.getElementById("pay");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, order]);

  // Polling: refresco ligero cada 60s solo en estados activos.
  useAutoRefresh({
    key: `order-status:${slug}:${orderUuid}`,
    enabled: !!order && isPollableOrder(order.status),
    minIntervalMs: 60_000,
    initialDelayMs: 60_000,
    load: () => fetchOrderStatus(slug, orderUuid),
    onData: (data) => {
      setOrder((prev) => {
        if (!prev) return prev;
        // Detectar cambio de estado → toast informativo.
        if (prev.status !== data.status) {
          if (data.status === "confirmed") {
            toast.success(t("order.paymentApproved"));
          } else if (data.status === "cancelled" && data.rejections_count > 0) {
            toast.error(t("order.paymentRejectedFinal"));
          } else if (data.status === "pending" && prev.status === "payment_reported") {
            toast.warning(t("order.paymentRejected"));
          }
        }
        prevStatusRef.current = data.status;
        return {
          ...prev,
          status: data.status,
          rejections_count: data.rejections_count,
          payment: prev.payment
            ? { ...prev.payment, status: data.payment_status ?? prev.payment.status }
            : prev.payment,
        };
      });
    },
  });

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
  const isAwaitingApproval = order.status === "payment_reported";
  const isRejectedPending = order.status === "pending" && order.rejections_count > 0;

  const report = async (
    e: React.FormEvent,
    reportData: Record<string, string>,
    files: Record<string, File> = {},
  ) => {
    e.preventDefault();
    if (!selectedMethod?.id || reporting) return;
    setReporting(true);
    try {
      // Subir comprobantes (type: image) a storage → URL en report_data.
      for (const [key, file] of Object.entries(files)) {
        const compressed = await compressImage(file);
        const { url } = await uploadPaymentReceipt(slug, order.uuid, compressed);
        reportData[key] = url;
      }

      const res = await reportPayment(slug, order.uuid, {
        payment_method_id: selectedMethod.id,
        report_data: reportData,
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
    } finally {
      setReporting(false);
    }
  };

  const markReceived = async () => {
    if (receiving) return;
    setReceiving(true);
    try {
      const res = await markOrderReceived(slug, order.uuid);
      setOrder(res);
      toast.success(t("order.received"));
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "";
      toast.error(message || t("order.receiveError"));
    } finally {
      setReceiving(false);
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

      {/* Banner de estado */}
      {isAwaitingApproval && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 print:hidden">
          <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-amber-800">
              {t("order.waitingApproval")}
            </p>
            {order.rejections_count > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {t("order.rejectionsLeft", { count: order.rejections_count })}
              </p>
            )}
          </div>
        </div>
      )}

      {isRejectedPending && (
        <div className="mt-4 rounded-2xl bg-orange-50 border border-orange-200 p-4 flex items-start gap-3 print:hidden">
          <XCircle className="size-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-orange-800">
              {t("order.paymentRejected")}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {t("order.rejectionsLeft", { count: order.rejections_count })}
            </p>
          </div>
        </div>
      )}

      {order.status === "pending" && !order.rejections_count && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 print:hidden">
          <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-amber-800">
              {t("order.pendingPaymentBanner")}
            </p>
          </div>
        </div>
      )}

      {order.status === "confirmed" && (
        <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3 print:hidden">
          <CheckCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-blue-800">
              {t("order.paymentApproved")}
            </p>
          </div>
        </div>
      )}

      {order.status === "cancelled" && order.rejections_count > 0 && (
        <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 print:hidden">
          <XCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-red-800">
              {t("order.paymentRejectedFinal")}
            </p>
          </div>
        </div>
      )}

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

        {(invoiceReady || canDownloadOrder(order.status)) && (
          <button
            onClick={() => window.print()}
            className="mt-4 w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 print:hidden"
            style={{ backgroundColor: accent }}
          >
            <Printer className="size-4" />{" "}
            {invoiceReady ? t("order.downloadInvoice") : t("order.downloadOrder")}
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
                style={{ backgroundColor: ORDER_STATUS_COLORS[h.status] ?? accent }}
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

      {/* Recibido */}
      {canMarkReceived(order.status) && (
        <section className="mt-4 rounded-3xl bg-card border border-border p-5 shadow-soft print:hidden">
          <h2 className="font-display font-bold">{t("order.markReceived")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("order.markReceivedHint")}
          </p>
          <button
            onClick={markReceived}
            disabled={receiving}
            className="mt-3 w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: accent }}
          >
            {receiving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {t("order.markReceived")}
          </button>
        </section>
      )}

      {/* Pago */}
      {canPay && (
        <section id="pay" className="mt-4 print:hidden">
          <h2 className="font-display font-bold text-lg mb-3">
            {t("payment.payOrder")}
          </h2>
          {isAwaitingApproval ? (
            <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="size-5 shrink-0" />
                <p>{t("order.waitingApproval")}</p>
              </div>
              {order.rejections_count > 0 && (
                <p className="mt-2 text-xs text-orange-600">
                  {t("order.rejectionsLeft", { count: order.rejections_count })}
                </p>
              )}
            </div>
          ) : storePaymentMethods.length > 0 ? (
            <>
              <PaymentMethodSelector
                methods={storePaymentMethods}
                selected={selectedMethod}
                onSelect={setSelectedMethod}
                accent={accent}
                t={t as unknown as (k: string, vars?: Record<string, string | number>) => string}
              />

              {selectedMethod && (
                <div className="mt-4 rounded-3xl bg-card border border-border p-5 shadow-soft">
                  <PaymentReportForm
                    key={selectedMethod.id}
                    method={selectedMethod}
                    total={Number(order.total)}
                    accent={accent}
                    t={t as unknown as (k: string, vars?: Record<string, string | number>) => string}
                    primaryCurrency={primaryCurrency}
                    secondaryCurrency={secondaryCurrency}
                    submitting={reporting}
                    onSubmit={report}
                  />
                </div>
              )}
            </>
          ) : methodsLoaded ? (
            <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
              <p className="text-sm text-muted-foreground">
                {t("payment.noMethods")}{" "}
                {waPhone ? (
                  <a
                    href={whatsappLink(
                      waPhone,
                      t("payment.noMethodsWx", { code: order.code }),
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline cursor-pointer hover:opacity-80"
                    style={{ color: accent }}
                  >
                    <MessageCircle className="size-3.5 inline -mt-0.5 mr-1" />
                    {t("payment.noMethodsLink")}
                  </a>
                ) : (
                  <span className="font-semibold text-foreground">
                    {t("payment.noMethodsLink")}
                  </span>
                )}
                .
              </p>
            </div>
          ) : null}
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

function methodLabel(_t: TFunc, method: string): string {
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
