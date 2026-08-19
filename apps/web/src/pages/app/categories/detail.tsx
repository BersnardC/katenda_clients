import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { DynamicIcon } from "@/components/IconPicker";
import { SkeletonView } from "@/components/skeletons";
import { useCategory, useAllCategories } from "@/hooks/useCategories";
import { categoryService } from "@/services/categoryService";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const { data: category, loading, error } = useCategory(uuid);
  const { data: categories } = useAllCategories();

  if (loading) {
    return <SkeletonView tiles={4} />;
  }

  if (error || !category) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("categories.notFound")}</p>
        <Link to="/categories" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const parent = category.parent_id
    ? categories?.find((c) => c.id === category.parent_id)
    : null;
  const children =
    categories?.filter((c) => c.parent_id === category.id) ?? [];

  const remove = async () => {
    try {
      await categoryService.destroy(category.uuid);
      toast.success(t("categories.deleted"));
      navigate("/categories");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("categories.deleteError"),
      );
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/categories"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl flex-1 truncate">
          {category.name}
        </h1>
        <Link
          to={`/categories/${category.uuid}/edit`}
          className="size-10 grid place-items-center rounded-full bg-primary/15 text-primary"
          aria-label={t("common.edit")}
        >
          <Pencil className="size-4" />
        </Link>
      </header>

      <div className="px-5 space-y-4">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full aspect-[4/3] rounded-2xl object-cover bg-muted"
          />
        ) : (
          <div className="w-full aspect-[4/3] rounded-2xl grid place-items-center bg-muted text-muted-foreground">
            <DynamicIcon name={category.icon} className="size-20" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            label={t("categories.status")}
            value={
              category.status === 1
                ? t("categories.activeLabel")
                : t("categories.inactiveLabel")
            }
            accent={category.status === 1 ? "success" : "muted"}
          />
          <InfoTile
            label={t("categories.productsLabel")}
            value={String(category.products_count ?? 0)}
          />
          <InfoTile
            label={t("categories.parentLabel")}
            value={parent ? parent.name : t("categories.rootLabel")}
          />
          <InfoTile
            label={t("categories.subcategories")}
            value={String(children.length)}
          />
        </div>

        {children.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-lg mb-2">
              {t("categories.subcategories")}
            </h2>
            <ul className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
              {children.map((sc) => (
                <li key={sc.uuid} className="shrink-0">
                  <Link
                    to={`/categories/${sc.uuid}`}
                    className="flex items-center gap-2 h-10 px-3 rounded-full bg-surface border border-border text-sm font-medium"
                  >
                    <DynamicIcon
                      name={sc.icon}
                      className="size-4 text-muted-foreground"
                    />
                    {sc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <button
          onClick={remove}
          className="w-full py-4 rounded-2xl bg-destructive/15 text-destructive font-semibold flex items-center justify-center gap-2"
        >
          <Trash2 className="size-4" /> {t("categories.deleteTitle")}
        </button>
      </div>
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
