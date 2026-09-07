import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useStores } from "@/hooks/useStores";
import { ItemsPaginator } from "@/components/ItemsPaginator";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { CustomerSkeleton } from "@/components/customers/CustomerSkeleton";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types/models";
import type { PaginationMeta } from "@/types/pagination";

const PAGE_SIZE = 20;

export function Component() {
  const { t } = useI18n();
  const { data: storesData } = useStores();
  const store = storesData?.data?.[0];
  const primaryCurrency = store?.currency?.code ?? "USD";
  const secondaryCurrency = store?.currency_secondary?.code ?? null;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState("");
  const [serverKey, setServerKey] = useState(0);

  const reload = useCallback(() => setServerKey((k) => k + 1), []);

  const load = useCallback(() => {
    customerService
      .index({ page: 1, per_page: PAGE_SIZE, search: q.trim() || undefined })
      .then((res) => {
        setCustomers(res.data);
        setMeta(res.meta);
      })
      .catch(() => toast.error(t("customers.loadError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return;
    setLoadingMore(true);
    customerService
      .index({
        page: meta.current_page + 1,
        per_page: PAGE_SIZE,
        search: q.trim() || undefined,
      })
      .then((res) => {
        setCustomers((prev) => [...prev, ...res.data]);
        setMeta(res.meta);
      })
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  };

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
            {t("customers.title")}
          </h1>
          <p className="text-xs text-muted-foreground tabular-nums">
            {customers.length}/{meta?.total ?? 0} {t("customers.subtitle")}
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
            placeholder={t("customers.search")}
            maxLength={100}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <ul className="px-5 mt-4 space-y-3">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <CustomerSkeleton key={i} />
          ))}
        {!loading && customers.length === 0 && (
          <li className="text-center text-sm text-muted-foreground py-12">
            {t("customers.empty")}
          </li>
        )}
        {!loading &&
          customers.map((c) => (
            <CustomerCard
              key={c.uuid}
              customer={c}
              primaryCurrency={primaryCurrency}
              secondaryCurrency={secondaryCurrency}
            />
          ))}
      </ul>

      <ItemsPaginator
        loaded={customers.length}
        total={meta?.total ?? 0}
        hasMore={meta ? meta.current_page < meta.last_page : false}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </>
  );
}
