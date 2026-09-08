"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MessageCircle,
  Package,
  Plus,
  Store,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAccountShell } from "@/components/account/AccountShell";
import { CardSkeleton, EmptyState } from "@/components/account/accountUi";
import { fmtCurrency, fmtIsoDate } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { ORDER_STATUS_COLORS, orderStatusKey, payState } from "@/lib/orders";
import {
  fetchMyOrders,
  readCachedOrders,
  saveCachedOrders,
} from "@/services/orderService";
import type { CustomerOrder } from "@/lib/customerAuth";

const PAGE = 10;

export function OrdersPage() {
  const { t } = useI18n();
  const { accent, slug } = useAccountShell();

  const [orders, setOrders] = useState<CustomerOrder[]>(
    () => readCachedOrders(slug) ?? [],
  );
  const [hasCache] = useState(() => readCachedOrders(slug) !== null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    let cancelled = false;
    fetchMyOrders(slug)
      .then((fresh) => {
        if (cancelled) return;
        setOrders(fresh);
        saveCachedOrders(slug, fresh);
      })
      .catch(() => {
        /* mantener lo cacheado en pantalla */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const shown = orders.slice(0, visible);

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight">
            {t("order.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading && orders.length === 0 && !hasCache
              ? "Cargando..."
              : t("order.count", { shown: shown.length, total: orders.length })}
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 h-10 rounded-full text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: accent }}
        >
          <Store className="size-4" /> {t("order.keepShopping")}
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {loading && orders.length === 0 && !hasCache ? (
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
        ) : !orders.length ? (
          <EmptyState icon={Package} text={t("order.empty")} />
        ) : (
          <>
            {shown.map((o) => (
              <OrderCard key={o.uuid} order={o} />
            ))}

            {visible < orders.length && (
              <button
                onClick={() => setVisible((v) => v + PAGE)}
                className="w-full h-12 rounded-2xl bg-surface border border-border font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Plus className="size-4" />{" "}
                {t("order.loadMore", { count: orders.length - visible })}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const { t } = useI18n();
  const { accent, primaryCurrency, secondaryCurrency, store, waPhone } =
    useAccountShell();

  const statusLabel = t(orderStatusKey(order.status));
  const payment = payState(order.payment?.status);

  return (
    <article className="block rounded-3xl bg-card border border-border p-4 shadow-soft hover:border-foreground/20 transition">
      <div className="flex items-center gap-2">
        <p className="font-semibold">{order.code}</p>
        <span
          className="px-2.5 h-6 grid place-items-center rounded-full text-[11px] font-bold capitalize"
          style={{
            backgroundColor:
              (ORDER_STATUS_COLORS[order.status] ?? "#f59e0b") + "26",
            color: ORDER_STATUS_COLORS[order.status] ?? "#f59e0b",
          }}
        >
          {statusLabel}
        </span>
        {payment !== "none" && (
          <span className="px-2 h-6 grid place-items-center rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
            {payment === "approved"
              ? t("order.payVerified")
              : t("order.payReported")}
          </span>
        )}
        <ChevronRight className="size-4 text-muted-foreground ml-auto" />
      </div>

      <p className="text-xs text-muted-foreground mt-1">
        {fmtIsoDate(order.created_at)} · {(order.items ?? []).length}{" "}
        {t("order.items")}
      </p>
      <p className="mt-2 text-sm truncate text-muted-foreground">
        {(order.items ?? [])
          .map((i) => `${i.qty}× ${i.name}`)
          .join(", ")}
      </p>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between font-display font-bold">
        <span>{t("order.total")}</span>
        <span style={{ color: accent }}>
          {fmtCurrency(Number(order.total), primaryCurrency)}
          {secondaryCurrency && (
            <span className="text-xs text-muted-foreground font-normal">
              {" "}
              · ≈ {fmtCurrency(Number(order.total), secondaryCurrency.code)}
            </span>
          )}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          href={`/account/orders/${order.uuid}`}
          className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold grid place-items-center"
          style={{ backgroundColor: accent }}
        >
          {t("order.viewDetail")}
        </Link>
        {waPhone && (
          <a
            href={whatsappLink(
              waPhone,
              `Hola, quiero consultar sobre mi pedido ${order.code}`,
            )}
            target="_blank"
            rel="noreferrer"
            aria-label={t("order.contactStoreAria", { store: store.name })}
            className="flex items-center gap-1.5 px-3 h-10 rounded-2xl bg-surface border border-border text-xs font-semibold"
          >
            <MessageCircle className="size-4" />
            {t("order.contactStore")}
          </a>
        )}
      </div>
    </article>
  );
}
