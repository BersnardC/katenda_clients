"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  FileText,
  Home,
  LayoutGrid,
  Loader2,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { DynamicIcon } from "@katenda_clients/ui/dynamic-icon";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useCustomerAuth } from "@/lib/customerAuth";
import { ACCENT_FALLBACK } from "@/lib/store";
import { fmtCurrency } from "@/lib/format";
import { useOrderWhatsapp } from "@/lib/useOrderWhatsapp";
import { ProductImg } from "@/components/common/ProductImg";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { getClientSlug } from "@/lib/clientSlug";
import {
  fetchFreshCategories,
  fetchFreshProducts,
} from "@/services/catalogClient";
import type {
  Category,
  Product,
  Store,
  StorefrontAccount,
} from "@/types/models";

const menuLinks = [
  { href: "#inicio", key: "store.nav.home" as const, icon: Home },
  { href: "#categorias", key: "store.nav.categories" as const, icon: LayoutGrid },
  { href: "#productos", key: "store.nav.products" as const, icon: ShoppingBag },
  { href: "#contacto", key: "store.nav.contact" as const, icon: Phone },
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
  const router = useRouter();
  const { lines, count, total, add, changeQty, remove, clear, syncFromCatalog } =
    useCart();
  const { customer: customerAccount } = useCustomerAuth();
  const isLoggedIn = Boolean(customerAccount);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  // Catálogo "vivo": refrescado sin recargar cuando el comercio publica.
  const [liveCatalog, setLiveCatalog] = useState<{
    products: Product[];
    categories: Category[];
  } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasMenuOpen = useRef(false);

  useEffect(() => {
    if (wasMenuOpen.current && !menuOpen) {
      menuButtonRef.current?.focus();
    }
    wasMenuOpen.current = menuOpen;
  }, [menuOpen]);

  const accent = store.accent_color ?? ACCENT_FALLBACK;
  const primaryCurrency = store.currency?.code ?? "USD";
  const secondaryCurrency = store.currency_secondary;
  const waPhone =
    store.contacts?.find((c) => c.type === "whatsapp")?.value ??
    account?.phone ??
    "";
  const verified = Boolean(account?.verified);

  // Pedido → WhatsApp en 2 pasos: registra el pedido y lo abre (o deja el
  // botón habilitado para que el propio usuario haga el clic).
  const {
    phase: orderPhase,
    order: registeredOrder,
    register: registerOrder,
    send: openWhatsapp,
    reset: resetOrder,
  } = useOrderWhatsapp({
    store,
    fallbackPhone: account?.phone,
    customer: customerAccount,
    requireLogin: () => router.push("/account"),
    onRegistered: clear,
  });

  const handleCheckout = () => {
    registerOrder(
      lines.map((l) => ({
        id: l.id,
        name: l.name,
        price: l.price,
        qty: l.qty,
      })),
      customerName,
    );
  };

  const handleKeepShopping = () => {
    clear();
    resetOrder();
  };

  // Si el carrito cambia tras registrar el pedido, el enlace de WhatsApp ya no
  // corresponde → volver al estado normal (evita enviar un resumen viejo).
  const cartKey = lines.map((l) => `${l.id}x${l.qty}`).join("|");
  const registeredKeyRef = useRef<string | null>(null);
  const prevPhaseRef = useRef(orderPhase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = orderPhase;
    if (orderPhase === "done" && prev !== "done") {
      registeredKeyRef.current = cartKey;
      return;
    }
    if (prev === "done" && orderPhase !== "done") {
      registeredKeyRef.current = null;
      return;
    }
    if (
      orderPhase === "done" &&
      registeredKeyRef.current !== null &&
      registeredKeyRef.current !== cartKey
    ) {
      resetOrder();
    }
  }, [cartKey, orderPhase, resetOrder]);

  // Fase 1 — frescura del catálogo: al montar y al volver a la pestaña
  // (oculta >10 s) se refresca en caliente (precio/stock/estado/categorías)
  // sin que el cliente recargue. El SSR cacheado sigue dando el 1er pintado.
  const loadFreshCatalog = useCallback(async () => {
    const slug = getClientSlug();
    if (!slug) return null;
    const [freshProducts, freshCategories] = await Promise.all([
      fetchFreshProducts(slug),
      fetchFreshCategories(slug),
    ]);
    return { products: freshProducts, categories: freshCategories };
  }, []);

  useAutoRefresh({
    key: `catalog:${getClientSlug() ?? ""}`,
    load: loadFreshCatalog,
    onData: (data) => {
      if (data) setLiveCatalog(data);
    },
  });

  // Reconciliación del carrito: si el comercio cambió un precio/stock y el
  // producto ya está en el carrito, la línea se alinea con el catálogo.
  useEffect(() => {
    if (!liveCatalog) return;
    syncFromCatalog(
      liveCatalog.products.map((p) => ({
        id: p.uuid,
        price: Number(p.price),
        stock: p.stock,
      })),
    );
  }, [liveCatalog, syncFromCatalog]);

  const shownProducts = liveCatalog?.products ?? products;
  const shownCategories = liveCatalog?.categories ?? categories;

  const activeCategories = shownCategories.filter((c) => c.status === 1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shownProducts.filter(
      (p) =>
        p.status === 1 &&
        p.stock > 0 &&
        (cat === "all" || p.category?.name === cat) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)),
    );
  }, [shownProducts, query, cat]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8 h-14 flex items-center gap-3 md:gap-4">
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen(true)}
            className="md:hidden size-10 shrink-0 grid place-items-center rounded-full bg-surface border border-border"
            aria-label={t("store.openMenu")}
          >
            <MenuIcon className="size-5" />
          </button>
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
            <span className="truncate max-w-[8rem]">{store.name}</span>
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
          <Link
            href="/account"
            className="ml-auto flex items-center gap-2 px-3 h-10 rounded-full bg-surface border border-border text-sm font-medium"
            aria-label={isLoggedIn ? t("store.myAccount") : t("store.enter")}
          >
            <UserRound className="size-4" />
            <span className="hidden sm:inline max-w-24 truncate">
              {isLoggedIn
                ? customerAccount?.name.split(" ")[0]
                : t("store.enter")}
            </span>
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 h-10 rounded-full text-white text-sm font-semibold"
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

      {/* Drawer de menú móvil (port fiel tienda.tsx) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-[visibility] duration-300 ${
          menuOpen ? "visible" : "invisible"
        }`}
        inert={!menuOpen}
      >
        <button
          aria-label={t("store.closeMenu")}
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          role="dialog"
          aria-label={t("store.nav.home")}
          className={`absolute inset-y-0 left-0 w-[82%] max-w-xs bg-background border-r border-border flex flex-col shadow-pop transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
            <span
              className="size-8 rounded-lg grid place-items-center text-white text-sm font-extrabold"
              style={{ backgroundColor: accent }}
            >
              {store.name.charAt(0)}
            </span>
            <span className="flex-1 min-w-0 truncate font-display font-extrabold">
              {store.name}
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="size-9 grid place-items-center rounded-full bg-surface border border-border"
              aria-label={t("store.closeMenu")}
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuLinks.map(({ href, key, icon: Icon }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 h-12 rounded-2xl text-[15px] font-medium text-foreground hover:bg-surface transition"
              >
                <span
                  className="size-9 shrink-0 grid place-items-center rounded-xl"
                  style={{ backgroundColor: accent + "1A", color: accent }}
                >
                  <Icon className="size-4" />
                </span>
                {t(key)}
              </a>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-3 safe-bottom">
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 h-12 rounded-2xl bg-surface border border-border text-sm font-semibold"
            >
              <UserRound className="size-4" style={{ color: accent }} />
              {isLoggedIn ? t("store.myAccount") : t("store.enter")}
            </Link>
            {waPhone && (
              <p className="px-1 text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5" style={{ color: accent }} />
                {waPhone}
              </p>
            )}
          </div>
        </aside>
      </div>

      <header id="inicio" className="relative scroll-mt-16">
        <div
          className="h-48 md:h-64 w-full overflow-hidden"
          style={{ backgroundColor: accent + "26" }}
        >
          {store.banner_url ? (
            <ProductImg
              src={store.banner_url}
              alt={`Banner de ${store.name}`}
              className="w-full h-full object-cover"
              priority
              fade={false}
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
                          <ProductImg
                            src={image}
                            alt={p.name}
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
                            stock: p.stock,
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
              <div className="flex items-center gap-2">
                {lines.length > 0 && (
                  <button
                    onClick={clear}
                    className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-surface border border-border text-xs font-semibold text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="size-3.5" /> {t("store.clearCart")}
                  </button>
                )}
                <button
                  onClick={() => setCartOpen(false)}
                  className="size-9 grid place-items-center rounded-full bg-surface border border-border"
                  aria-label={t("store.cartClose")}
                >
                  <X className="size-4" />
                </button>
              </div>
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
                      {l.stock > 0 && l.qty >= l.stock && (
                        <p className="text-[11px] text-muted-foreground">
                          {t("store.maxStock")}
                        </p>
                      )}
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
                        disabled={l.stock > 0 && l.qty >= l.stock}
                        className="size-8 grid place-items-center rounded-full bg-surface border border-border disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={t("store.addOne")}
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        onClick={() => remove(l.id)}
                        className="size-8 grid place-items-center rounded-full bg-surface border border-border text-muted-foreground hover:text-destructive transition"
                        aria-label={t("store.removeItem", { name: l.name })}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border p-5 space-y-3 safe-bottom">
              {!isLoggedIn ? (
                <Link
                  href="/account"
                  className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2"
                >
                  <UserRound className="size-5" /> {t("store.loginRequired")}
                </Link>
              ) : orderPhase === "done" && registeredOrder ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 p-3">
                    <span className="size-7 shrink-0 rounded-full bg-[#25D366] text-white grid place-items-center">
                      <Check className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-snug">
                        {t("store.orderRegistered", {
                          code: registeredOrder.code,
                        })}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {t("store.orderRegisteredHint")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={openWhatsapp}
                    className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="size-5" />
                    {t("store.openWhatsapp")}
                  </button>
                  <button
                    onClick={handleKeepShopping}
                    className="w-full h-11 rounded-2xl bg-surface border border-border text-sm font-semibold"
                  >
                    {t("store.keepShopping")}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={customerName || customerAccount?.name || ""}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                    disabled={
                      lines.length === 0 || orderPhase === "registering"
                    }
                    onClick={handleCheckout}
                    className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {orderPhase === "registering" ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <MessageCircle className="size-5" />
                    )}
                    {orderPhase === "registering"
                      ? t("store.orderRegistering")
                      : t("store.sendOrder")}
                  </button>
                </>
              )}
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

