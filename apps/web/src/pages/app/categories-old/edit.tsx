import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { CategoryForm, type CategoryFormValue } from "@/components/categories/CategoryForm";
import { SkeletonForm } from "@/components/skeletons";
import { useCategory, useAllCategories } from "@/hooks/useCategories-old";
import { categoryService } from "@/services/categoryService";
import { slugify, dataUrlToFile } from "@/lib/utils";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const { data: category, loading, error } = useCategory(uuid);
  const { data: categories } = useAllCategories();
  const [form, setForm] = useState<CategoryFormValue | null>(null);

  useEffect(() => {
    if (category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: category.name,
        image: category.image_url,
        icon: category.icon || "Tag",
        active: category.status === 1,
        parentId: category.parent_id,
      });
    } else {
      setForm(null);
    }
  }, [uuid, category]);

  if (loading) {
    return <SkeletonForm />;
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

  if (!form) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }
    try {
      await categoryService.update(category.uuid, {
        name: form.name.trim(),
        slug: slugify(form.name),
        icon: form.icon || "Tag",
        parent_id: form.parentId ?? undefined,
        status: form.active ? 1 : 0,
      });
      if (form.image && form.image.startsWith("data:")) {
        const file = await dataUrlToFile(form.image, "categoria.jpg");
        await categoryService.uploadImage(category.uuid, file);
      } else if (form.image === null && category.image_url) {
        await categoryService.removeImage(category.uuid);
      }
      toast.success(t("categories.updated"));
      navigate(`/categories/${category.uuid}`);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("categories.updateError"),
      );
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to={`/categories/${category.uuid}`}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">
          {t("categories.edit")}
        </h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <CategoryForm
          value={form}
          onChange={setForm}
          categories={categories ?? []}
          excludeId={category.id}
        />
        <button
          type="submit"
          className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
        >
          {t("common.save")}
        </button>
      </form>
    </>
  );
}
