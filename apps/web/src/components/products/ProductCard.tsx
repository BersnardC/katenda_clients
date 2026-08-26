import { Link } from "react-router-dom";
import { Trash2, Pencil, ImageIcon } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import { StockBadge } from "@/components/products/StockBadge";
import type { Product } from "@/types/models";

const formatPrice = (price: string) => {
  const num = Number(price);
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : price;
};

export function ProductCard({
  product,
  onToggle,
  onDelete,
}: {
  product: Product;
  onToggle: (p: Product, activate: boolean) => void;
  onDelete: (p: Product) => void;
}) {
  const { t } = useI18n();
  const active = product.status === 1;
  const cover = product.media?.[0]?.url;
  const subline = [product.store?.name, product.category?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft">
      <Link to={`/products/${product.uuid}`} className="shrink-0">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            className="size-20 rounded-xl object-cover bg-muted"
          />
        ) : (
          <div className="size-20 rounded-xl grid place-items-center bg-muted text-muted-foreground">
            <ImageIcon className="size-6" />
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link to={`/products/${product.uuid}`} className="block min-w-0">
                <p className="font-semibold text-sm truncate hover:text-primary">
                  {product.name}
                </p>
              </Link>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {active
                  ? t("products.activeLabel")
                  : t("products.inactiveLabel")}
              </span>
            </div>
            {subline && (
              <p className="text-xs text-muted-foreground truncate">
                {subline}
              </p>
            )}
          </div>
          <Switch
            checked={active}
            onCheckedChange={(v) => onToggle(product, v)}
            aria-label={t("products.active")}
          />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-display font-bold text-base">
            {formatPrice(product.price)}
          </span>
          <StockBadge stock={product.stock} />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Link
            to={`/products/${product.uuid}/edit`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold"
            aria-label={t("common.edit")}
          >
            <Pencil className="size-3" /> {t("common.edit")}
          </Link>
          <button
            onClick={() => onDelete(product)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold ml-auto"
            aria-label={`Eliminar ${product.name}`}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>
    </li>
  );
}
