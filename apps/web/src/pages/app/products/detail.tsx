import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ImageIcon,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { ProductDetailSkeleton } from "@/components/products/ProductDetailSkeleton";
import { StockBadge } from "@/components/products/StockBadge";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { productService } from "@/services/productService";
import type { Product } from "@/types/models";

const formatPrice = (price: string) => {
  const num = Number(price);
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : price;
};

export function Component() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    productService
      .show(uuid)
      .then((res) => {
        if (alive) setProduct(res.data);
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

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("products.notFound")}</p>
        <Link to="/products" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const media = product.media ?? [];
  const images = media.map((m) => m.url);
  const mainImage = images[active] ?? null;
  const categoryName = product.category?.name ?? null;
  const createdLabel = new Date(product.created_at).toLocaleDateString(
    lang === "es" ? "es" : "en",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const remove = async () => {
    try {
      await productService.destroy(product.uuid);
      toast.success(t("products.deleted"));
      navigate("/products");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("products.deleteError"),
      );
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/products"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl flex-1 truncate">
          {product.name}
        </h1>
        <Link
          to={`/products/${product.uuid}/edit`}
          className="size-10 grid place-items-center rounded-full bg-primary/15 text-primary"
          aria-label={t("common.edit")}
        >
          <Pencil className="size-4" />
        </Link>
      </header>

      <div className="px-5 space-y-4">
        <div className="rounded-2xl overflow-hidden bg-muted border border-border">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square grid place-items-center text-muted-foreground">
              <ImageIcon className="size-16" />
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 size-16 rounded-xl overflow-hidden border-2 transition ${
                  active === i ? "border-primary" : "border-border opacity-70"
                }`}
              >
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-3xl text-primary">
            {formatPrice(product.price)}
          </span>
          <StockBadge stock={product.stock} />
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryName && (
            <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface border border-border text-xs font-semibold">
              {categoryName}
            </span>
          )}
          {product.store && (
            <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface border border-border text-xs font-semibold">
              <StoreIcon className="size-3" /> {product.store.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface border border-border text-xs font-semibold">
            <ImageIcon className="size-3" /> {images.length}{" "}
            {t("products.mediaLabel")}
          </span>
        </div>

        {product.description && (
          <section>
            <h2 className="font-display font-bold text-lg mb-1.5">
              {t("products.description")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            label={t("products.status")}
            value={
              product.status === 1
                ? t("products.activeLabel")
                : t("products.inactiveLabel")
            }
            accent={product.status === 1 ? "success" : "muted"}
          />
          <InfoTile
            label={t("products.priceLabel")}
            value={formatPrice(product.price)}
          />
          <InfoTile
            label={t("products.stockLabel")}
            value={String(product.stock)}
          />
          <InfoTile
            label={t("products.createdLabel")}
            value={createdLabel}
          />
        </div>

        <button
          onClick={() => setOpenDelete(true)}
          className="w-full py-4 rounded-2xl bg-destructive/15 text-destructive font-semibold flex items-center justify-center gap-2"
        >
          <Trash2 className="size-4" /> {t("products.deleteTitle")}
        </button>
      </div>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={t("products.deleteTitle")}
        description={t("products.deleteConfirm")}
        onConfirm={remove}
      />
    </>
  );
}

function InfoTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "success" | "muted";
}) {
  const cls =
    accent === "success"
      ? "bg-success/15 text-success-foreground"
      : accent === "muted"
        ? "bg-muted text-muted-foreground"
        : "bg-card";
  return (
    <div className={`rounded-2xl border border-border p-3 ${cls}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
