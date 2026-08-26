import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import type { Category } from "@/types/models";

const emptyForm: ProductFormValue = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  categoryId: null,
  images: [],
  available: true,
};

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormValue>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const mediaLimit = usePlanLimit("media_per_product");

  useEffect(() => {
    let alive = true;
    categoryService
      .index({ page: 1, per_page: 100, status: "active" })
      .then((res) => {
        if (alive) setCategories(res.data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <ProductFormSkeleton />;
  }

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
      const res = await productService.create({
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim() || undefined,
        price,
        stock: Number(form.stock) || 0,
        category_id: form.categoryId,
        status: form.available ? 1 : 0,
      });
      if (form.images.length > 0) {
        const files = await Promise.all(
          form.images.map((src) => dataUrlToFile(src, "producto.jpg")),
        );
        await productService.uploadImages(res.data.uuid, files);
      }
      toast.success(t("products.created"));
      navigate(`/products/${res.data.uuid}`);
    } catch (err) {
      toast.error(errMsg(err, t("products.createError")));
    } finally {
      setSaving(false);
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
        <h1 className="font-display font-bold text-2xl">{t("products.new")}</h1>
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
          {saving ? t("products.creating") : t("products.create")}
        </button>
      </form>
    </>
  );
}
