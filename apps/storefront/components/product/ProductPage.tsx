"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { ACCENT_FALLBACK } from "@/lib/store";
import { fmtCurrency, fmtDate } from "@/lib/format";
import {
  normalizeWhatsappSettings,
  renderWhatsappMessage,
  whatsappLink,
} from "@/lib/whatsapp";
import type { Product, Store } from "@/types/models";

interface ProductPageProps {
  store: Store;
  verified: boolean;
  product: Product;
  products: Product[];
}

export function ProductPage({
  store,
  verified,
  product,
  products,
}: ProductPageProps) {
  const { t } = useI18n();
  const { count, add } = useCart();
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const [added, setAdded] = useState(false);

  const accent = store.accent_color ?? ACCENT_FALLBACK;
  const primaryCurrency = store.currency?.code ?? "USD";
  const secondaryCurrency = store.currency_secondary;
  const wa = normalizeWhatsappSettings(store.settings);
  const waPhone =
    store.contacts?.find((c) => c.type === "whatsapp")?.value ?? "";

  const gallery = product.media?.length
    ? product.media.map((m) => m.url)
    : [];

  const related = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.status === 1 &&
            p.category?.name === product.category?.name &&
            p.uuid !== product.uuid,
        )
        .slice(0, 4),
    [products, product.category?.name, product.uuid],
  );

  const totalPrice = Number(product.price) * qty;

  const handleAdd = () => {
    add(
      {
        id: product.uuid,
        name: product.name,
        price: Number(product.price),
        image: gallery[0],
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const orderByWhatsapp = () => {
    const productos = `• ${qty}× ${product.name} – ${fmtCurrency(totalPrice, primaryCurrency)}`;
    const text = renderWhatsappMessage(wa.template, {
      cliente: "Cliente",
      tienda: store.name,
      productos,
      total: wa.include_total ? fmtCurrency(totalPrice, primaryCurrency) : "—",
      fecha: fmtDate(new Date()),
    });
    const message = wa.include_note && wa.note ? `${text}\n\n${wa.note}` : text;
    const link = whatsappLink(waPhone, message);
    if (link) window.open(link, "_blank");
  };

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
            href="/"
            className="ml-auto relative flex items-center gap-2 px-4 h-10 rounded-full text-white text-sm font-semibold"
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
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 md:px-8 py-6">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted border border-border">
              {gallery.length > 0 ? (
                <img
                  src={gallery[shot]}
                  alt={product.name}
                  className="w-full h-full object-cover"
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
                    <img
                      src={g}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {product.category?.name ?? ""}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
                {product.name}
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
                  {fmtCurrency(Number(product.price), primaryCurrency)}
                </p>
                {secondaryCurrency && (
                  <p className="text-sm text-muted-foreground pb-1 tabular-nums">
                    ≈ {fmtCurrency(Number(product.price), secondaryCurrency.code)}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="size-9 grid place-items-center rounded-full bg-surface border border-border"
                    aria-label={t("store.removeOne")}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="size-9 grid place-items-center rounded-full bg-surface border border-border"
                    aria-label={t("store.addOne")}
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
                <button
                  onClick={orderByWhatsapp}
                  className="h-[52px] rounded-2xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-5" /> {t("product.orderWhatsapp")}
                </button>
              </div>
            </div>

            {waPhone && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="size-4" style={{ color: accent }} />
                {t("product.delivery", { phone: waPhone })}
              </div>
            )}

            {product.description && (
              <div className="mt-5">
                <h2 className="font-display font-bold text-lg mb-1">
                  {t("product.description")}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
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
              {related.map((p) => {
                const image = p.media?.[0]?.url;
                return (
                  <Link
                    key={p.uuid}
                    href={`/p/${p.uuid}`}
                    className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft flex flex-col"
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
                          <ShoppingBag className="size-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                        {p.name}
                      </h3>
                      <p className="font-display font-bold" style={{ color: accent }}>
                        {fmtCurrency(Number(p.price), primaryCurrency)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
