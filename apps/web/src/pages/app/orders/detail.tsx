import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleSlash,
  MapPin,
  Mail,
  Phone,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n, type Key } from "@/lib/i18n";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { OrderDetailSkeleton } from "@/components/orders/OrderSkeleton";
import { orderService } from "@/services/orderService";
import { ORDER_STATUSES, STATUS_FLOW, statusColor } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/models";

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

const STATUS_KEYS: Record<string, Key> = {
  pendiente: "orders.statusPendiente",
  confirmado: "orders.statusConfirmado",
  preparando: "orders.statusPreparando",
  enviado: "orders.statusEnviado",
  entregado: "orders.statusEntregado",
  cancelado: "orders.statusCancelado",
};

const statusT = (t: (k: Key) => string, s: string): string =>
  t(STATUS_KEYS[s] ?? "orders.statusPendiente");

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [note, setNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const load = () => {
    orderService
      .show(uuid)
      .then((res) => {
        setOrder(res.data);
        setNote(res.data.note ?? "");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const setStatus = async (s: OrderStatus) => {
    if (savingStatus) return;
    setSavingStatus(true);
    try {
      await orderService.updateStatus(uuid, s);
      toast.success(
        t("orders.statusUpdated").replace("{status}", statusT(t, s)),
      );
      load();
    } catch (err) {
      toast.error(errMsg(err, t("orders.statusError")));
    } finally {
      setSavingStatus(false);
    }
  };

  const saveNote = async () => {
    if (savingNote) return;
    setSavingNote(true);
    try {
      await orderService.updateNote(uuid, note.trim());
      toast.success(t("orders.noteSaved"));
    } catch (err) {
      toast.error(errMsg(err, t("orders.noteError")));
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return <OrderDetailSkeleton />;

  if (error || !order) {
    return (
      <div className="px-5 py-16 text-center space-y-4">
        <p className="text-muted-foreground">{t("orders.notFound")}</p>
        <Link
          to="/orders"
          className="inline-block px-5 h-11 leading-[2.75rem] rounded-2xl gradient-brand text-primary-foreground font-semibold"
        >
          {t("orders.back")}
        </Link>
      </div>
    );
  }

  const stepIndex = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
  const isCancelled = order.status === "cancelado";
  const nextStatus =
    stepIndex >= 0 && stepIndex < STATUS_FLOW.length - 1
      ? (STATUS_FLOW[stepIndex + 1] as OrderStatus)
      : null;

  const c = order.customer;
  const dateLabel = new Date(order.created_at).toLocaleDateString();

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/orders")}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl">{order.code}</h1>
          <p className="text-xs text-muted-foreground">{dateLabel}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {/* Progreso */}
      <section className="px-5">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-soft">
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            {t("orders.progress")}
          </p>
          <div className="flex items-center">
            {STATUS_FLOW.map((s, i) => {
              const done = stepIndex >= i && !isCancelled;
              return (
                <div key={s} className="flex-1 flex items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`size-7 rounded-full grid place-items-center text-[10px] font-bold ${
                        done
                          ? "gradient-brand text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {statusT(t, s)}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 -mt-4 ${
                        stepIndex > i && !isCancelled ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cliente */}
      {c && (
        <section className="px-5 mt-4">
          <h2 className="font-display font-bold text-lg mb-2">
            {t("orders.customer")}
          </h2>
          <div className="p-4 rounded-2xl bg-card border border-border shadow-soft space-y-2 text-sm">
            <p className="font-semibold">{c.name}</p>
            {c.phone && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" /> {c.phone}
              </p>
            )}
            {c.email && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> {c.email}
              </p>
            )}
            {(c.address || c.city) && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                {[c.address, c.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Productos */}
      <section className="px-5 mt-4">
        <h2 className="font-display font-bold text-lg mb-2">
          {t("orders.products")}
        </h2>
        <ul className="rounded-2xl bg-card border border-border shadow-soft divide-y divide-border">
          {(order.items ?? []).map((i) => (
            <li key={i.id} className="flex items-center gap-3 p-3">
              <span className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center text-xs font-bold">
                {i.qty}×
              </span>
              <p className="flex-1 text-sm truncate">{i.name}</p>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  ${(Number(i.price) * i.qty).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 p-4 rounded-2xl bg-card border border-border shadow-soft text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("orders.subtotal")}</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("orders.discount")}</span>
              <span className="text-accent font-semibold">
                -${Number(order.discount).toFixed(2)}
              </span>
            </div>
          )}
          {Number(order.shipping) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("orders.shipping")}</span>
              <span>${Number(order.shipping).toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="font-display font-bold">{t("orders.total")}</span>
            <p className="font-display font-extrabold text-xl">
              ${Number(order.total).toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      {/* Gestión */}
      <section className="px-5 mt-4">
        <h2 className="font-display font-bold text-lg mb-2">
          {t("orders.manage")}
        </h2>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-soft space-y-3">
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value as OrderStatus)}
                disabled={savingStatus || isCancelled}
                className={`px-3 h-9 rounded-full text-xs font-semibold transition disabled:opacity-50 ${
                  order.status === s.value
                    ? "text-white shadow-pop"
                    : "bg-muted text-muted-foreground"
                }`}
                style={
                  order.status === s.value
                    ? { backgroundColor: s.color }
                    : undefined
                }
              >
                {statusT(t, s.value)}
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("orders.notePlaceholder")}
            rows={3}
            maxLength={1000}
            className="w-full p-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm resize-none"
          />
          <button
            onClick={saveNote}
            disabled={savingNote}
            className="w-full h-11 rounded-2xl bg-muted text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Save className="size-4" /> {t("orders.saveNote")}
          </button>

          {!isCancelled && order.status !== "entregado" && (
            <div className="flex gap-2">
              {nextStatus && (
                <button
                  onClick={() => setStatus(nextStatus)}
                  disabled={savingStatus}
                  className="flex-1 h-12 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
                >
                  {t("orders.markNext").replace("{status}", statusT(t, nextStatus).toLowerCase())}
                </button>
              )}
              <button
                onClick={() => setStatus("cancelado")}
                disabled={savingStatus}
                className="h-12 px-4 rounded-2xl bg-destructive/10 text-destructive font-semibold flex items-center gap-2"
              >
                <CircleSlash className="size-4" /> {t("orders.cancel")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Historial */}
      <section className="px-5 mt-4 pb-6">
        <h2 className="font-display font-bold text-lg mb-2">
          {t("orders.history")}
        </h2>
        <ul className="p-4 rounded-2xl bg-card border border-border shadow-soft space-y-3">
          {(order.events ?? []).map((h) => (
            <li key={h.id} className="flex items-center gap-3 text-sm">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: statusColor(h.status) }}
              />
              <span className="flex-1">
                {statusT(t, h.status)}
                {h.note ? ` · ${h.note}` : ""}
              </span>
              <span className="text-xs text-muted-foreground">
                {h.created_at
                  ? new Date(h.created_at).toLocaleDateString()
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

