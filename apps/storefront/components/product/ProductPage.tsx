"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Loader2,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserRound,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useCustomerAuth } from "@/lib/customerAuth";
import { ACCENT_FALLBACK } from "@/lib/store";
import { fmtCurrency } from "@/lib/format";
import { useOrderWhatsapp } from "@/lib/useOrderWhatsapp";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductImg } from "@/components/common/ProductImg";
import { takeOpenCartOnReturn } from "@/lib/checkoutIntent";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { getClientSlug } from "@/lib/clientSlug";
import { fetchFreshProduct } from "@/services/catalogClient";
import type { Product, Store, StorefrontAccount } from "@/types/models";

interface ProductPageProps {
  store: Store;
  account: StorefrontAccount | null;
  verified: boolean;
  product: Product;
  products: Product[];
}

export function ProductPage({
  store,
  account,
  verified,
  product,
  products,
}: ProductPageProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { count, add } = useCart();
  const { customer } = useCustomerAuth();
  const isLoggedIn = Boolean(customer);
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Si venimos de autenticarnos para hacer el pedido, abrimos el carrito.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (takeOpenCartOnReturn()) setCartOpen(true);
  }, []);

  // Producto "vivo": detalle refrescado sin recargar (precio/stock/estado).
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);

  const p = liveProduct ?? product;

  const accent = store.accent_color ?? ACCENT_FALLBACK;
  const primaryCurrency = store.currency?.code ?? "USD";
  const secondaryCurrency = store.currency_secondary;
  const waPhone =
    store.contacts?.find((c) => c.type === "whatsapp")?.value ??
    account?.phone ??
    "";

  const gallery = p.media?.length
    ? p.media.map((m) => m.url)
    : [];

  const related = useMemo(
    () =>
      products
        .filter(
          (r) =>
            r.status === 1 &&
            r.stock > 0 &&
            r.category?.name === p.category?.name &&
            r.uuid !== p.uuid,
        )
        .slice(0, 4),
    [products, p.category?.name, p.uuid],
  );

  const outOfStock = p.stock <= 0;
  const maxQty = outOfStock ? 0 : p.stock;

  const totalPrice = Number(p.price) * qty;

  const handleAdd = () => {
    if (outOfStock) return;
    const finalQty = Math.min(qty, maxQty);
    if (finalQty < 1) return;
    add({
      id: p.uuid,
      name: p.name,
      price: Number(p.price),
      image: gallery[0],
      stock: maxQty,
      qty: finalQty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  // Pedido → WhatsApp en 2 pasos (mismo flujo que el carrito de la tienda).
  const {
    phase: orderPhase,
    order: registeredOrder,
    register: registerOrder,
    send: openWhatsapp,
    reset: resetOrder,
  } = useOrderWhatsapp({
    store,
    fallbackPhone: account?.phone,
    customer,
    requireLogin: () => router.push("/account"),
    onRegistered: () => {
      /* sin carrito en el producto directo */
    },
  });

  const orderByWhatsapp = () => {
    registerOrder(
      [
        {
          id: p.uuid,
          name: p.name,
          price: Number(p.price),
          qty,
        },
      ],
      customer?.name.split(" ")[0],
    );
  };

  // Si el usuario cambia la cantidad tras registrar, el enlace ya no
  // corresponde → volver al estado normal.
  const prevQtyRef = useRef(qty);
  useEffect(() => {
    if (orderPhase === "done" && qty !== prevQtyRef.current) {
      resetOrder();
    }
    prevQtyRef.current = qty;
  }, [qty, orderPhase, resetOrder]);

  // Refresco en caliente del detalle (montaje + volver a la pestaña): si el
  // comercio cambió precio/stock/estado, se refleja sin recargar la página.
  const loadFreshProduct = useCallback(async () => {
    const slug = getClientSlug();
    if (!slug) return null;
    return fetchFreshProduct(slug, product.uuid);
  }, [product.uuid]);

  useAutoRefresh({
    key: `product:${getClientSlug() ?? ""}:${product.uuid}`,
    load: loadFreshProduct,
    onData: (data) => {
      if (data && data.uuid === product.uuid) setLiveProduct(data);
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 h-9 rounded-full bg-surface border border-border text-sm font-medium"
          >
            <ArrowLeft className="size-4" /> {t("product.back")}
          </Link>
          <span className="truncate font-display font-extrabold tracking-tight">
            {store.name}
          </span>
          <Link
            href="/account"
            className="ml-auto flex items-center gap-2 px-3 h-10 rounded-full bg-surface border border-border text-sm font-medium"
            aria-label={isLoggedIn ? t("store.myAccount") : t("store.enter")}
          >
            <UserRound className="size-4" />
            <span className="hidden sm:inline max-w-24 truncate">
              {isLoggedIn
                ? customer?.name.split(" ")[0]
                : t("store.enter")}
            </span>
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 h-10 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: accent }}
            aria-label={t("store.viewCart")}
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

      <main className="mx-auto w-full max-w-6xl px-4 md:px-8 py-6">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted border border-border">
              {gallery.length > 0 ? (
                <ProductImg
                  src={gallery[shot] ?? gallery[0]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  priority
                  fade={false}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground/40">
                  <ShoppingBag className="size-14" />
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                {gallery.map((g, i) => (
                  <button
                    key={g + i}
                    onClick={() => setShot(i)}
                    className={`size-16 rounded-2xl overflow-hidden border-2 shrink-0 ${
                      i === shot ? "" : "border-border"
                    }`}
                    style={i === shot ? { borderColor: accent } : undefined}
                    aria-label={t("product.viewImage", { index: i + 1 })}
                  >
                    <ProductImg
                      src={g}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {p.category?.name ?? ""}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
                {p.name}
              </h1>
              {verified && (
                <span
                  className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-semibold text-white"
                  style={{ backgroundColor: accent }}
                  title={t("store.verifiedTitle")}
                >
                  <BadgeCheck className="size-3.5" /> {t("store.verified")}
                </span>
              )}
            </div>

            <div className="mt-5 rounded-3xl bg-card border border-border p-4">
              <div className="flex items-end gap-3">
                <p
                  className="font-display font-extrabold text-3xl"
                  style={{ color: accent }}
                >
                  {fmtCurrency(Number(p.price), primaryCurrency)}
                </p>
                {secondaryCurrency && (
                  <p className="text-sm text-muted-foreground pb-1 tabular-nums">
                    ≈ {fmtCurrency(Number(p.price), secondaryCurrency.code)}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="size-9 grid place-items-center rounded-full bg-surface border border-border disabled:opacity-40"
                    aria-label={t("store.removeOne")}
                    disabled={outOfStock || qty <= 1}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="size-9 grid place-items-center rounded-full bg-surface border border-border disabled:opacity-40"
                    aria-label={t("store.addOne")}
                    disabled={outOfStock || qty >= maxQty}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">
                    {t("product.subtotal")}
                  </p>
                  <p className="font-display font-bold tabular-nums">
                    {fmtCurrency(totalPrice, primaryCurrency)}
                  </p>
                </div>
              </div>

              {outOfStock ? (
                <div className="mt-4 rounded-2xl bg-warning/15 text-warning-foreground font-semibold h-[52px] grid place-items-center">
                  {t("product.outOfStock")}
                </div>
              ) : (
                <div className="mt-4 grid gap-2">
                  <button
                    onClick={handleAdd}
                    className="h-[52px] rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
                    style={{ backgroundColor: accent }}
                  >
                    {added ? (
                      <Check className="size-5" />
                    ) : (
                      <ShoppingCart className="size-5" />
                    )}
                    {added ? t("product.added") : t("product.addToCart")}
                  </button>
                  {orderPhase === "done" && registeredOrder ? (
                    <div className="rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 p-3 space-y-2">
                      <p className="flex items-start gap-2 text-sm font-semibold leading-snug">
                        <span className="size-6 shrink-0 rounded-full bg-[#25D366] text-white grid place-items-center">
                          <Check className="size-3.5" />
                        </span>
                        {t("store.orderRegistered", {
                          code: registeredOrder.code,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("store.orderRegisteredHint")}
                      </p>
                      <button
                        onClick={openWhatsapp}
                        className="w-full h-11 rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="size-4" />
                        {t("store.openWhatsapp")}
                      </button>
                      <Link
                        href={`/account/orders/${registeredOrder.uuid}`}
                        className="w-full h-11 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
                        style={{ backgroundColor: accent }}
                      >
                        <Package className="size-4" /> {t("store.viewOrder")}
                      </Link>
                      <button
                        onClick={resetOrder}
                        className="w-full text-xs font-medium text-muted-foreground hover:text-foreground py-1 transition"
                      >
                        {t("store.keepShopping")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={orderByWhatsapp}
                      disabled={orderPhase === "registering"}
                      className="h-[52px] rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {orderPhase === "registering" ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <MessageCircle className="size-5" />
                      )}
                      {orderPhase === "registering"
                        ? t("store.orderRegistering")
                        : t("product.orderWhatsapp")}
                    </button>
                  )}
                </div>
              )}
            </div>

            {waPhone && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="size-4" style={{ color: accent }} />
                {t("product.delivery", { phone: waPhone })}
              </div>
            )}

            {p.description && (
              <div className="mt-5">
                <h2 className="font-display font-bold text-lg mb-1">
                  {t("product.description")}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display font-bold text-xl mb-4">
              {t("product.related")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {related.map((r) => {
                const image = r.media?.[0]?.url;
                return (
                  <Link
                    key={r.uuid}
                    href={`/p/${r.uuid}`}
                    className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft flex flex-col"
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      {image ? (
                        <ProductImg
                          src={image}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-muted-foreground/40">
                          <ShoppingBag className="size-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                        {r.name}
                      </h3>
                      <p className="font-display font-bold" style={{ color: accent }}>
                        {fmtCurrency(Number(r.price), primaryCurrency)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        store={store}
        account={account}
      />
    </div>
  );
}

