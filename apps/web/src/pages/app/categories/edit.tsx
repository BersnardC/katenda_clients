import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import {
  CategoryForm,
  type CategoryFormValue,
} from "@/components/categories/CategoryForm";
import { SkeletonForm } from "@/components/skeletons";
import { categoryService } from "@/services/categoryService";
import { slugify, dataUrlToFile } from "@/lib/utils";
import type { Category } from "@/types/models";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [parents, setParents] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryFormValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    categoryService
      .show(uuid, { addons: "products_count" })
      .then((res) => {
        if (!alive) return;
        setCategory(res.data);
        setForm({
          name: res.data.name,
          image: res.data.image_url,
          icon: res.data.icon || "Tag",
          active: res.data.status === 1,
          parentId: res.data.parent_id,
        });
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    categoryService
      .index({ per_page: 100 })
      .then((res) => {
        if (alive) setParents(res.data);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [uuid]);

  if (loading) {
    return <SkeletonForm />;
  }

  if (error || !category || !form) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("categories.notFound")}</p>
        <Link to="/categories" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }
    setSaving(true);
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
    } finally {
      setSaving(false);
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
          categories={parents}
          excludeId={category.id}
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop cursor-pointer disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </form>
    </>
  );
}
