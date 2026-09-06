import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { ItemsPaginator } from "@/components/ItemsPaginator";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { OrderCardSkeleton } from "@/components/orders/OrderSkeleton";
import { orderService } from "@/services/orderService";
import { ORDER_STATUSES } from "@/lib/orders";
import type { Order } from "@/types/models";
import type { PaginationMeta } from "@/types/pagination";

const PAGE_SIZE = 20;

type DateFilter = "all" | "7d" | "30d" | "90d";

const DAYS_TO = (d: DateFilter): number =>
  d === "7d" ? 7 : d === "30d" ? 30 : d === "90d" ? 90 : 0;

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export function Component() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateFilter>("all");
  const [serverKey, setServerKey] = useState(0);

  // Los filtros viajan al backend (?status=&search=&from=&to=). Se dispara un
  // reload cuando cambian (server paginated).
  const reload = useCallback(() => setServerKey((k) => k + 1), []);

  const fromFor = (d: DateFilter): string | undefined => {
    if (d === "all") return undefined;
    return toISODate(new Date(Date.now() - DAYS_TO(d) * 86400000));
  };

  const load = useCallback(() => {
    orderService
      .index({
        page: 1,
        per_page: PAGE_SIZE,
        status,
        search: q || undefined,
        from: fromFor(dateRange),
      })
      .then((res) => {
        setOrders(res.data);
        setMeta(res.meta);
      })
      .catch(() => {
        toast.error(t("orders.loadError"));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return;
    setLoadingMore(true);
    orderService
      .index({
        page: meta.current_page + 1,
        per_page: PAGE_SIZE,
        status,
        search: q || undefined,
        from: fromFor(dateRange),
      })
      .then((res) => {
        setOrders((prev) => [...prev, ...res.data]);
        setMeta(res.meta);
      })
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  };

  // Subtotal revenue local para el subtítulo (los ya cargados).
  const revenue = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((s, o) => s + Number(o.total), 0);

  const statusChips = ["all", ...ORDER_STATUSES.map((s) => s.value)] as const;

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="size-10 shrink-0 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-2xl">
            {t("orders.title")}
          </h1>
          <p className="text-xs text-muted-foreground tabular-nums">
            {orders.length}/{meta?.total ?? 0} · $
            {revenue.toFixed(2)}
          </p>
        </div>
      </header>

      <div className="px-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && reload()}
            placeholder={t("orders.search")}
            maxLength={100}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {statusChips.map((s) => (
            <FilterChip
              key={s}
              active={status === s}
              label={
                s === "all"
                  ? t("orders.filterAll")
                  : (t as (k: string) => string)(
                      `orders.status${cap(s)}`,
                    )
              }
              color={s === "all" ? undefined : ORDER_STATUSES.find((x) => x.value === s)?.color}
              onClick={() => {
                setStatus(s);
                reload();
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground shrink-0" />
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "7d", "30d", "90d"] as const).map((d) => (
              <FilterChip
                key={d}
                active={dateRange === d}
                label={
                  d === "all"
                    ? t("orders.filterDate")
                    : (t as (k: string) => string)(
                        `orders.filter${d}`,
                      )
                }
                onClick={() => {
                  setDateRange(d);
                  reload();
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <ul className="px-5 mt-4 space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        {!loading && orders.length === 0 && (
          <li className="text-center text-sm text-muted-foreground py-12">
            {t("orders.empty")}
          </li>
        )}
        {!loading &&
          orders.map((o) => (
            <Link
              key={o.uuid}
              to={`/orders/${o.uuid}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft active:scale-[0.99] transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{o.code}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-sm mt-0.5 truncate">{o.customer?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {(o.items ?? []).reduce((s, i) => s + i.qty, 0)} {t("orders.art")} ·{" "}
                  {(o.items ?? []).map((i) => i.name).join(", ")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-extrabold">
                  ${Number(o.total).toFixed(2)}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
      </ul>

      <ItemsPaginator
        loaded={orders.length}
        total={meta?.total ?? 0}
        hasMore={meta ? meta.current_page < meta.last_page : false}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </>
  );
}

function FilterChip({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 h-9 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
        active
          ? "gradient-brand text-primary-foreground shadow-pop"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {color && <span className="size-2 rounded-full" style={{ backgroundColor: color }} />}
      {label}
    </button>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
