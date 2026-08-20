import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@katenda_clients/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import {
  CategoryForm,
  type CategoryFormValue,
} from "@/components/categories/CategoryForm";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategorySkeleton } from "@/components/categories/CategorySkeleton";
import { categoryService } from "@/services/categoryService";
import { slugify, dataUrlToFile } from "@/lib/utils";
import type { Category } from "@/types/models";

const emptyForm: CategoryFormValue = {
  name: "",
  image: null,
  icon: "Tag",
  active: true,
  parentId: null,
};

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  /* Declarations */
  const { t } = useI18n();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState<CategoryFormValue>(emptyForm);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  useEffect(() => {
    load();
  }, []);

  const term = q.trim().toLowerCase();
  const visible = cats.filter((c) => {
    const matchText = !term || c.name.toLowerCase().includes(term);
    const matchStatus =
      status === "all" ||
      (status === "active" ? c.status === 1 : c.status === 0);
    return matchText && matchStatus;
  });

  const tabs: { value: typeof status; label: string }[] = [
    { value: "all", label: t("categories.filterAll") },
    { value: "active", label: t("categories.filterActive") },
    { value: "inactive", label: t("categories.filterInactive") },
  ];

  /* Functions */
  const load = () => {
    categoryService
      .index({ per_page: 100, addons: "products_count" })
      .then((res) => setCats(res.data))
      .finally(() => setLoading(false));
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }
    try {
      const res = await categoryService.create({
        name: form.name.trim(),
        slug: slugify(form.name),
        icon: form.icon || "Tag",
        parent_id: form.parentId ?? undefined,
        status: form.active ? 1 : 0,
      });
      if (form.image && form.image.startsWith("data:")) {
        const file = await dataUrlToFile(form.image, "categoria.jpg");
        await categoryService.uploadImage(res.data.uuid, file);
      }
      toast.success(t("categories.created"));
      setOpenCreate(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(errMsg(err, t("categories.createError")));
    }
  };

  const toggle = async (c: Category, activate: boolean) => {
    try {
      if (activate) await categoryService.activate(c.uuid);
      else await categoryService.deactivate(c.uuid);
      toast.success(
        activate ? t("categories.activated") : t("categories.deactivated"),
      );
      load();
    } catch (err) {
      toast.error(errMsg(err, t("categories.statusError")));
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await categoryService.destroy(toDelete.uuid);
      toast.success(t("categories.deleted"));
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, t("categories.deleteError")));
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t("nav.categories")}</h1>
      </header>

      <div className="px-5 mt-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("categories.search")}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 h-9 rounded-full text-xs font-semibold transition ${
                status === tab.value
                  ? "gradient-brand text-primary-foreground shadow-pop"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="px-5 mt-4 space-y-3">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        {!loading && visible.length === 0 && (
          <li className="text-center text-sm text-muted-foreground py-12">
            {t("common.empty")}
          </li>
        )}
        {!loading &&
          visible.map((c) => (
            <CategoryCard
              key={c.uuid}
              category={c}
              parent={c.parent_id ? cats.find((p) => p.id === c.parent_id) ?? null : null}
              onToggle={toggle}
              onDelete={setToDelete}
            />
          ))}
      </ul>

      <button
        onClick={() => {
          setForm(emptyForm);
          setOpenCreate(true);
        }}
        className="fixed bottom-24 right-5 md:bottom-8 z-30 size-14 rounded-2xl gradient-brand shadow-pop grid place-items-center text-primary-foreground"
        aria-label={t("categories.new")}
      >
        <Plus className="size-7" />
      </button>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("categories.new")}</DialogTitle>
            <DialogDescription>{t("categories.newSub")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-4">
            <CategoryForm value={form} onChange={setForm} categories={cats} />
            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="px-4 h-11 rounded-2xl bg-muted font-semibold text-sm"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="px-5 h-11 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm shadow-pop"
              >
                {t("categories.create")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t("categories.deleteTitle")}
        description={t("categories.deleteConfirm")}
        onConfirm={remove}
      />
    </>
  );
}
