import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { usePlanLimit } from "@/hooks/useAccount";
import {
  ProductForm,
  type ProductFormValue,
} from "@/components/products/ProductForm";
import { ProductFormSkeleton } from "@/components/products/ProductFormSkeleton";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { slugify, dataUrlToFile } from "@/lib/utils";
import type { Product, Category, Media } from "@/types/models";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const mediaLimit = usePlanLimit("media_per_product");

  useEffect(() => {
    let alive = true;
    productService
      .show(uuid)
      .then((res) => {
        if (!alive) return;
        setProduct(res.data);
        setForm({
          name: res.data.name,
          description: res.data.description ?? "",
          price: res.data.price,
          stock: String(res.data.stock),
          categoryId: res.data.category_id,
          images: res.data.media?.map((m) => m.url) ?? [],
          available: res.data.status === 1,
        });
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    categoryService
      .index({ page: 1, per_page: 100, status: "all" })
      .then((res) => {
        if (alive) setCategories(res.data);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [uuid]);

  if (loading) {
    return <ProductFormSkeleton />;
  }

  if (error || !product || !form) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("products.notFound")}</p>
        <Link to="/products" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const syncMedia = async (existing: Media[]) => {
    const removed = existing.filter((m) => !form.images.includes(m.url));
    const added = form.images.filter((src) => src.startsWith("data:"));

    if (removed.length > 0) {
      await Promise.all(
        removed.map((m) => productService.removeImage(uuid, m.uuid)),
      );
    }
    if (added.length > 0) {
      const files = await Promise.all(
        added.map((src) => dataUrlToFile(src, "producto.jpg")),
      );
      await productService.uploadImages(uuid, files);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      toast.error(t("products.nameRequired"));
      return;
    }
    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price <= 0) {
      toast.error(t("products.priceInvalid"));
      return;
    }
    if (!form.categoryId) {
      toast.error(t("products.categoryRequired"));
      return;
    }
    setSaving(true);
    try {
      await productService.update(uuid, {
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim() || undefined,
        price,
        stock: Number(form.stock) || 0,
        category_id: form.categoryId,
        status: form.available ? 1 : 0,
      });
      await syncMedia(product.media ?? []);
      toast.success(t("products.updated"));
      navigate(`/products/${uuid}`);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("products.updateError"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to={`/products/${uuid}`}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">
          {t("products.edit")}
        </h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <ProductForm
          value={form}
          onChange={setForm}
          categories={categories}
          mediaLimit={mediaLimit}
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
