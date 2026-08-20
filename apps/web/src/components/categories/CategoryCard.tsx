import { Link } from "react-router-dom";
import { Trash2, Eye, Pencil } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import { DynamicIcon } from "@/components/IconPicker";
import type { Category } from "@/types/models";

export function CategoryCard({
  category,
  parent,
  onToggle,
  onDelete,
}: {
  category: Category;
  parent: Category | null;
  onToggle: (c: Category, activate: boolean) => void;
  onDelete: (c: Category) => void;
}) {
  const { t } = useI18n();
  const c = category;

  return (
    <li className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft">
      {c.image_url ? (
        <img
          src={c.image_url}
          alt={c.name}
          className="size-20 rounded-xl object-cover bg-muted"
        />
      ) : (
        <div className="size-20 rounded-xl grid place-items-center bg-muted text-muted-foreground">
          <DynamicIcon name={c.icon} className="size-8" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{c.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {parent ? `↳ ${parent.name}` : t("categories.rootLabel")}
              {c.products_count !== undefined &&
                ` · ${c.products_count} ${t("categories.products")}`}
            </p>
          </div>
          <Switch
            checked={c.status === 1}
            onCheckedChange={(v) => onToggle(c, v)}
            aria-label={t("categories.active")}
          />
        </div>
        <div className="mt-2 flex gap-1.5">
          <Link
            to={`/categories/${c.uuid}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-semibold"
          >
            <Eye className="size-3" /> {t("common.view")}
          </Link>
          <Link
            to={`/categories/${c.uuid}/edit`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold"
          >
            <Pencil className="size-3" /> {t("common.edit")}
          </Link>
          <button
            onClick={() => onDelete(c)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold ml-auto"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>
    </li>
  );
}
