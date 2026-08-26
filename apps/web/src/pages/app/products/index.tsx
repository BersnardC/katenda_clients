import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { usePlanLimit } from "@/hooks/useAccount";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { PlanLimitDialog } from "@/components/PlanLimitDialog";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { ItemsPaginator } from "@/components/ItemsPaginator";
import { productService } from "@/services/productService";
import type { Product } from "@/types/models";
import type { PaginationMeta } from "@/types/pagination";

const PAGE_SIZE = 20;

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  /* Declarations */
  const { t } = useI18n();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [openLimit, setOpenLimit] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const limit = usePlanLimit("products");
  const totalCount = meta?.total ?? 0;
  const atMax = limit !== undefined && totalCount >= limit;

  const term = q.trim().toLowerCase();
  const visible = products.filter((p) => {
    const matchText =
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.description ?? "").toLowerCase().includes(term);
    const matchStatus =
      status === "all" ||
      (status === "active" ? p.status === 1 : p.status === 0);
    return matchText && matchStatus;
  });

  const tabs: { value: typeof status; label: string }[] = [
    { value: "all", label: t("products.filterAll") },
    { value: "active", label: t("products.filterActive") },
    { value: "inactive", label: t("products.filterInactive") },
  ];

  /* Functions */
  const load = useCallback(() => {
    productService
      .index({ page: 1, per_page: PAGE_SIZE, status })
      .then((res) => {
        setProducts(res.data);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const loadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return;
    setLoadingMore(true);
    productService
      .index({ page: meta.current_page + 1, per_page: PAGE_SIZE, status })
      .then((res) => {
        setProducts((prev) => [...prev, ...res.data]);
        setMeta(res.meta);
      })
      .finally(() => setLoadingMore(false));
  };

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (p: Product, activate: boolean) => {
    try {
      if (activate) await productService.activate(p.uuid);
      else await productService.deactivate(p.uuid);
      toast.success(
        activate ? t("products.activated") : t("products.deactivated"),
      );
      load();
    } catch (err) {
      toast.error(errMsg(err, t("products.statusError")));
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await productService.destroy(toDelete.uuid);
      toast.success(t("products.deleted"));
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, t("products.deleteError")));
    }
  };

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
        <h1 className="font-display font-bold text-2xl">
          {t("nav.inventory")}
          {limit !== undefined && (
            <span className="pl-2 font-semibold text-[10px] text-muted-foreground">
              {totalCount} / {limit}
            </span>
          )}
        </h1>
      </header>

      <div className="px-5 mt-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("products.search")}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 h-9 rounded-full text-xs font-semibold transition ${
                status === tab.value
                  ? "gradient-brand text-primary-foreground shadow-pop"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
            {products.length}/{meta?.total ?? 0}
          </span>
        </div>
      </div>

      <ul className="px-5 mt-4 space-y-3">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        {!loading && visible.length === 0 && (
          <li className="text-center text-sm text-muted-foreground py-12">
            {t("products.empty")}
          </li>
        )}
        {!loading &&
          visible.map((p) => (
            <ProductCard
              key={p.uuid}
              product={p}
              onToggle={toggle}
              onDelete={setToDelete}
            />
          ))}
      </ul>

      <ItemsPaginator
        loaded={products.length}
        total={meta?.total ?? 0}
        hasMore={meta ? meta.current_page < meta.last_page : false}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />

      <button
        onClick={() => {
          if (atMax) {
            setOpenLimit(true);
            return;
          }
          navigate("/products/new");
        }}
        className="fixed bottom-24 right-5 md:bottom-8 z-30 size-14 rounded-2xl gradient-brand shadow-pop grid place-items-center text-primary-foreground"
        aria-label={t("products.new")}
      >
        <Plus className="size-7" />
      </button>

      <PlanLimitDialog
        open={openLimit}
        onOpenChange={setOpenLimit}
        feature={t("products.title").toLowerCase()}
      />

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t("products.deleteTitle")}
        description={t("products.deleteConfirm")}
        onConfirm={remove}
      />
    </>
  );
}
