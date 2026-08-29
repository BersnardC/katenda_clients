import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStores } from "@/hooks/useStores";
import { DynamicIcon } from "@/components/IconPicker";
import { api } from "@/lib/api";
import { ACCENT_FALLBACK, STORE_URL_PREFIX } from "@/lib/store";
import type { Category, Product, Store } from "@/types/models";
import type { RawPaginated } from "@/types/pagination";

export function Component() {
  const { t } = useI18n();
  const { data, loading: storesLoading } = useStores();
  const slug = data?.data?.[0]?.slug;

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    Promise.all([
      api.get<{ store: Store }>(`/s/${slug}`),
      api.get<{ products: RawPaginated<Product> }>(
        `/s/${slug}/products?per_page=50`,
      ),
      api.get<{ categories: Category[] }>(`/s/${slug}/categories`),
    ])
      .then(([s, p, c]) => {
        if (!alive) return;
        setStore(s.store);
        setProducts(p.products.data ?? []);
        setCategories(c.categories ?? []);
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
  }, [slug]);

  const activeCategories = categories.filter((c) => c.status === 1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.status === 1 &&
        (cat === "all" || p.category?.name === cat) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)),
    );
  }, [products, query, cat]);

  if (!slug && !storesLoading) {
    return (
      <div className="px-5 py-16 text-center">
        <ShoppingBag className="size-10 mx-auto mb-3 opacity-50" />
        <p className="font-semibold">{t("storefront.inactive")}</p>
        <Link to="/stores" className="inline-block mt-4 px-4 h-10 leading-10 rounded-xl bg-card border border-border text-sm font-semibold">
          {t("storefront.edit")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative">
        <div
          className="h-48 md:h-64 w-full overflow-hidden"
          style={{ backgroundColor: ACCENT_FALLBACK + "26" }}
        >
          {store?.banner_url ? (
            <img
              src={store.banner_url}
              alt={`Banner de ${store.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${ACCENT_FALLBACK}33, transparent 70%)`,
              }}
            />
          )}
        </div>
        <Link
          to="/stores"
          className="absolute top-4 left-4 flex items-center gap-2 px-3 h-10 rounded-full bg-background/85 backdrop-blur border border-border text-sm font-medium"
        >
          <ArrowLeft className="size-4" /> {t("storefront.edit")}
        </Link>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="-mt-12 md:-mt-14 flex flex-col md:flex-row md:items-end gap-4">
          <div
            className="relative size-24 md:size-28 rounded-3xl grid place-items-center overflow-hidden border-4 border-background shadow-pop font-display font-extrabold text-3xl text-white shrink-0"
            style={{ backgroundColor: ACCENT_FALLBACK }}
          >
            {store?.logo_url ? (
              <img
                src={store.logo_url}
                alt={`Logo de ${store?.name ?? ""}`}
                className="w-full h-full object-cover"
              />
            ) : (
              store?.name.charAt(0) ?? "K"
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
              {store?.name ?? ""}
            </h1>
            <p className="text-muted-foreground">{store?.description}</p>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {STORE_URL_PREFIX}
              {store?.slug}
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mt-6 bg-background/90 backdrop-blur border-b border-border">
          <label className="flex items-center gap-2 px-4 h-12 rounded-2xl bg-surface border border-border">
            <Search className="size-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("storefront.search")}
              maxLength={80}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </label>

          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            <Chip active={cat === "all"} accent={ACCENT_FALLBACK} onClick={() => setCat("all")}>
              {t("storefront.all")}
            </Chip>
            {activeCategories.map((c) => (
              <Chip
                key={c.id}
                active={cat === c.name}
                accent={ACCENT_FALLBACK}
                onClick={() => setCat(c.name)}
              >
                <DynamicIcon name={c.icon} className="size-4" />
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        <section className="py-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display font-bold text-xl">
              {t("storefront.products")}
            </h2>
            <span className="text-sm text-muted-foreground tabular-nums">
              {loading ? "…" : `${filtered.length} ${t("storefront.results")}`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-card border border-border overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-20 text-center text-muted-foreground">
              <p>{t("storefront.loadError")}</p>
              <Link to="/stores" className="inline-block mt-4 px-4 h-10 leading-10 rounded-xl bg-card border border-border text-sm font-semibold">
                {t("storefront.edit")}
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <ShoppingBag className="size-10 mx-auto mb-3 opacity-50" />
              <p>{t("storefront.empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {filtered.map((p) => (
                <article
                  key={p.uuid}
                  className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft flex flex-col"
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={p.media?.[0]?.url}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {p.category?.name ?? ""}
                    </p>
                    <h3 className="font-semibold text-sm md:text-base leading-snug line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <div>
                        <p
                          className="font-display font-bold text-lg"
                          style={{ color: ACCENT_FALLBACK }}
                        >
                          ${Number(p.price).toFixed(2)}
                        </p>
                      </div>
                      <button
                        className="size-9 grid place-items-center rounded-full text-white shrink-0"
                        style={{ backgroundColor: ACCENT_FALLBACK }}
                        aria-label={`Pedir ${p.name}`}
                      >
                        <ShoppingBag className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="py-10 border-t border-border text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{store?.name}</p>
          <p className="tabular-nums">
            {STORE_URL_PREFIX}
            {store?.slug}
          </p>
        </footer>
      </div>
    </div>
  );
}

function Chip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 shrink-0 px-4 h-9 rounded-full text-sm font-medium border transition ${
        active ? "text-white border-transparent" : "bg-surface border-border text-muted-foreground"
      }`}
      style={active ? { backgroundColor: accent } : undefined}
    >
      {children}
    </button>
  );
}
