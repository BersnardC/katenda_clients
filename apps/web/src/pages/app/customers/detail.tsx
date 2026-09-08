import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStores } from "@/hooks/useStores";
import { fmtCurrency } from "@/lib/currency";
import {
  CUSTOMER_TAGS,
  segmentFor,
  formatDate,
} from "@/lib/customers";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { CustomerDetailSkeleton } from "@/components/customers/CustomerDetailSkeleton";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types/models";

export function Component() {
  const { t, lang } = useI18n();
  const { uuid = "" } = useParams();
  const { data: storesData } = useStores();
  const store = storesData?.data?.[0];
  const primaryCurrency = store?.currency?.code ?? "USD";
  const secondaryCurrency = store?.currency_secondary?.code ?? null;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    customerService
      .show(uuid)
      .then((res) => {
        if (alive) setCustomer(res.data);
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [uuid]);

  if (loading) return <CustomerDetailSkeleton />;

  if (error || !customer) {
    return (
      <div className="px-5 py-16 text-center space-y-2">
        <p className="text-muted-foreground">{t("customers.notFound")}</p>
        <Link to="/customers" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const tag = CUSTOMER_TAGS[segmentFor(customer.orders_count)];
  const initial = customer.name.trim().charAt(0).toUpperCase();
  const orders = customer.orders ?? [];
  const address = [customer.address, customer.city]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/customers"
          className="size-10 shrink-0 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl flex-1 truncate">
          {customer.name}
        </h1>
      </header>

      <div className="px-5 space-y-4 pb-8">
        <section className="p-4 rounded-2xl bg-card border border-border shadow-soft flex gap-4 items-center">
          <div className="size-20 rounded-full grid place-items-center text-3xl font-bold bg-primary/15 text-primary">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{customer.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {customer.email}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: tag.color + "33", color: tag.color }}
              >
                {tag.label}
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Tile
            label={t("customers.ordersCount")}
            value={String(customer.orders_count)}
          />
          <Tile
            label={t("customers.totalSpent")}
            value={fmtCurrency(customer.total_spent, primaryCurrency)}
            sub={
              secondaryCurrency
                ? `≈ ${fmtCurrency(customer.total_spent, secondaryCurrency)}`
                : undefined
            }
          />
          <Tile
            label={t("customers.memberSince")}
            value={formatDate(customer.member_since, lang)}
          />
          <Tile
            label={t("customers.lastOrder")}
            value={formatDate(customer.last_order_at, lang)}
          />
        </section>

        <section className="p-4 rounded-2xl bg-card border border-border space-y-2">
          <h2 className="font-display font-bold text-lg">
            {t("customers.contact")}
          </h2>
          <Row icon={Phone} text={customer.whatsapp ?? "—"} />
          <Row icon={Mail} text={customer.email} />
          <Row icon={MapPin} text={address || "—"} />
          <Row
            icon={CalendarDays}
            text={`${t("customers.customerSince")} ${formatDate(customer.member_since, lang)}`}
          />
        </section>

        <section>
          <h2 className="font-display font-bold text-lg mb-2">
            {t("customers.history")}
          </h2>
          {orders.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8 rounded-2xl border border-dashed border-border">
              {t("customers.noOrders")}
            </div>
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li key={o.uuid}>
                  <Link
                    to={`/orders/${o.uuid}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border active:scale-[0.99] transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{o.code}</p>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {(o.items ?? []).map((i) => i.name).join(", ")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(o.created_at, lang)} ·{" "}
                        {o.payment_method ?? ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-extrabold text-sm">
                        {fmtCurrency(Number(o.total), primaryCurrency)}
                      </p>
                      {secondaryCurrency && (
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          ≈ {fmtCurrency(Number(o.total), secondaryCurrency)}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Row({ icon: Icon, text }: { icon: typeof Phone; text: string }) {
  return (
    <p className="text-sm text-muted-foreground flex items-center gap-2">
      <Icon className="size-4 shrink-0" />{" "}
      <span className="truncate">{text}</span>
    </p>
  );
}

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
