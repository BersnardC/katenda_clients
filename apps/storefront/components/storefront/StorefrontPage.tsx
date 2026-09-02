"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  FileText,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import { DynamicIcon } from "@katenda_clients/ui/dynamic-icon";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { ACCENT_FALLBACK } from "@/lib/store";
import { fmtCurrency, fmtDate } from "@/lib/format";
import {
  normalizeWhatsappSettings,
  renderWhatsappMessage,
  whatsappLink,
} from "@/lib/whatsapp";
import type {
  Category,
  Product,
  Store,
  StorefrontAccount,
} from "@/types/models";

const menuLinks = [
  { href: "#inicio", key: "store.nav.home" as const },
  { href: "#categorias", key: "store.nav.categories" as const },
  { href: "#productos", key: "store.nav.products" as const },
  { href: "#contacto", key: "store.nav.contact" as const },
];

interface StorefrontPageProps {
  store: Store;
  account: StorefrontAccount | null;
  products: Product[];
  categories: Category[];
}

export function StorefrontPage({
  store,
  account,
  products,
  categories,
}: StorefrontPageProps) {
  const { t } = useI18n();
  const { lines, count, total, add, changeQty } = useCart();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState("");

  const accent = store.accent_color ?? ACCENT_FALLBACK;
  const primaryCurrency = store.currency?.code ?? "USD";
  const secondaryCurrency = store.currency_secondary;
  const wa = normalizeWhatsappSettings(store.settings);
  const waPhone =
    store.contacts?.find((c) => c.type === "whatsapp")?.value ??
    account?.phone ??
    "";
  const verified = Boolean(account?.verified);

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

  const sendOrder = () => {
    if (count === 0) return;
    const productos = lines
      .map(
        (l) =>
          `• ${l.qty}× ${l.name} – ${fmtCurrency(l.qty * l.price, primaryCurrency)}`,
      )
      .join("\n");
    const text = renderWhatsappMessage(wa.template, {
      cliente: customer.trim() || "Cliente",
      tienda: store.name,
      productos,
      total: wa.include_total ? fmtCurrency(total, primaryCurrency) : "—",
      fecha: fmtDate(new Date()),
    });
    const message = wa.include_note && wa.note ? `${text}\n\n${wa.note}` : text;
    const link = whatsappLink(waPhone, message);
    if (link) window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8 h-14 flex items-center gap-4">
          <a
            href="#inicio"
            className="flex items-center gap-2 font-display font-extrabold tracking-tight"
          >
            <span
              className="size-7 rounded-lg grid place-items-center text-white text-sm"
              style={{ backgroundColor: accent }}
            >
              {store.name.charAt(0)}
            </span>
            <span className="truncate max-w-[10rem]">{store.name}</span>
          </a>
          <div className="hidden md:flex items-center gap-1 ml-2">
            {menuLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 h-9 grid place-items-center rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition"
              >
                {t(l.key)}
              </a>
            ))}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="ml-auto relative flex items-center gap-2 px-4 h-10 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: accent }}
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">{t("store.viewCart")}</span>
            {count > 0 && (
              <span className="grid place-items-center min-w-5 h-5 px-1 rounded-full bg-background text-foreground text-[11px] font-bold tabular-nums">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      <header id="inicio" className="relative scroll-mt-16">
        <div
          className="h-48 md:h-64 w-full overflow-hidden"
          style={{ backgroundColor: accent + "26" }}
        >
          {store.banner_url ? (
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
                background: `linear-gradient(135deg, ${accent}33, transparent 70%)`,
              }}
            />
          )}
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="-mt-12 md:-mt-14 flex flex-col md:flex-row md:items-end gap-4">
          <div
            className="relative size-24 md:size-28 rounded-3xl grid place-items-center overflow-hidden border-4 border-background shadow-pop font-display font-extrabold text-3xl text-white shrink-0"
            style={{ backgroundColor: accent }}
          >
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={`Logo de ${store.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              store.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
                {store.name}
              </h1>
              {verified && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: accent }}
                  title={t("store.verifiedTitle")}
                >
                  <BadgeCheck className="size-4" /> {t("store.verified")}
                </span>
              )}
            </div>
            {store.description && (
              <p className="text-muted-foreground">{store.description}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {account?.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" style={{ color: accent }} />
              {account.address}
            </span>
          )}
          {account?.rif && (
            <span className="flex items-center gap-1.5">
              <FileText className="size-4" style={{ color: accent }} />
              {account.rif}
            </span>
          )}
          {waPhone && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-4" style={{ color: accent }} />
              {waPhone}
            </span>
          )}
        </div>

        <div
          id="categorias"
          className="sticky top-14 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mt-6 bg-background/90 backdrop-blur border-b border-border scroll-mt-16"
        >
          <label className="flex items-center gap-2 px-4 h-12 rounded-2xl bg-surface border border-border">
            <Search className="size-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("store.search")}
              maxLength={80}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </label>

          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            <Chip
              active={cat === "all"}
              accent={accent}
              onClick={() => setCat("all")}
            >
              {t("store.all")}
            </Chip>
            {activeCategories.map((c) => (
              <Chip
                key={c.uuid}
                active={cat === c.name}
                accent={accent}
                onClick={() => setCat(c.name)}
              >
                <DynamicIcon name={c.icon} className="size-4" />
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        <section id="productos" className="py-6 scroll-mt-32">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display font-bold text-xl">
              {t("store.products")}
            </h2>
            <span className="text-sm text-muted-foreground tabular-nums">
              {filtered.length} {t("store.results")}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <ShoppingBag className="size-10 mx-auto mb-3 opacity-50" />
              <p>{t("store.empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {filtered.map((p) => {
                const image = p.media?.[0]?.url;
                return (
                  <article
                    key={p.uuid}
                    className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft flex flex-col"
                  >
                    <Link
                      href={`/p/${p.uuid}`}
                      className="flex flex-col flex-1"
                      aria-label={`Ver ${p.name}`}
                    >
                      <div className="aspect-square bg-muted overflow-hidden">
                        {image ? (
                          <img
                            src={image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-muted-foreground/40">
                            <ShoppingBag className="size-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 md:p-4 flex-1 flex flex-col">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {p.category?.name ?? ""}
                        </p>
                        <h3 className="font-semibold text-sm md:text-base leading-snug line-clamp-2">
                          {p.name}
                        </h3>
                      </div>
                    </Link>
                    <div className="px-3 md:px-4 pb-3 md:pb-4 flex items-center justify-between gap-2">
                      <div>
                        <p
                          className="font-display font-bold text-lg"
                          style={{ color: accent }}
                        >
                          {fmtCurrency(Number(p.price), primaryCurrency)}
                        </p>
                        {secondaryCurrency && (
                          <p className="text-xs text-muted-foreground tabular-nums">
                            ≈{" "}
                            {fmtCurrency(
                              Number(p.price),
                              secondaryCurrency.code,
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          add({
                            id: p.uuid,
                            name: p.name,
                            price: Number(p.price),
                            image,
                          })
                        }
                        className="size-9 grid place-items-center rounded-full text-white shrink-0"
                        style={{ backgroundColor: accent }}
                        aria-label={t("store.addAria", { name: p.name })}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer
          id="contacto"
          className="py-10 border-t border-border text-sm text-muted-foreground scroll-mt-32"
        >
          <p className="font-semibold text-foreground">{store.name}</p>
          {account?.address && <p>{account.address}</p>}
          {account?.rif && <p>{account.rif}</p>}
          {waPhone && (
            <p className="mt-2 flex items-center gap-1.5">
              <Phone className="size-4" style={{ color: accent }} />
              {waPhone}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {menuLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition"
              >
                {t(l.key)}
              </a>
            ))}
          </div>
        </footer>
      </div>

      {count > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-center gap-2 h-14 rounded-2xl text-white font-semibold shadow-pop"
          style={{ backgroundColor: accent }}
        >
          <ShoppingCart className="size-5" /> {t("store.viewCart")} ·{" "}
          {t("store.quantity", { count, total: fmtCurrency(total, primaryCurrency) })}
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label={t("store.cartClose")}
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <aside className="relative w-full sm:max-w-md h-full bg-background border-l border-border flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border">
              <h2 className="font-display font-bold text-lg">
                {t("store.cart")}
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="size-9 grid place-items-center rounded-full bg-surface border border-border"
                aria-label={t("store.cartClose")}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {lines.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <ShoppingBag className="size-10 mx-auto mb-3 opacity-50" />
                  <p>{t("store.cartEmpty")}</p>
                </div>
              ) : (
                lines.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
                  >
                    {l.image && (
                      <img
                        src={l.image}
                        alt={l.name}
                        className="size-14 rounded-xl object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{l.name}</p>
                      <p className="text-sm" style={{ color: accent }}>
                        {fmtCurrency(l.price * l.qty, primaryCurrency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQty(l.id, -1)}
                        className="size-8 grid place-items-center rounded-full bg-surface border border-border"
                        aria-label={t("store.removeOne")}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">
                        {l.qty}
                      </span>
                      <button
                        onClick={() => changeQty(l.id, 1)}
                        className="size-8 grid place-items-center rounded-full bg-surface border border-border"
                        aria-label={t("store.addOne")}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border p-5 space-y-3 safe-bottom">
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder={t("store.customerName")}
                maxLength={60}
                className="w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none text-sm"
              />
              <div className="flex items-center justify-between font-display font-bold text-lg">
                <span>{t("store.total")}</span>
                <span style={{ color: accent }}>
                  {fmtCurrency(total, primaryCurrency)}
                </span>
              </div>
              <button
                disabled={lines.length === 0}
                onClick={sendOrder}
                className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle className="size-5" /> {t("store.sendOrder")}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                {t("store.sendHint", { phone: waPhone })}
              </p>
            </div>
          </aside>
        </div>
      )}
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
