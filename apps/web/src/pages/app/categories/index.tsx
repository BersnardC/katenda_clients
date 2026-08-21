import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Search, Crown, Loader2 } from "lucide-react";
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
import { usePlanLimit } from "@/hooks/useAccount";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import {
  CategoryForm,
  type CategoryFormValue,
} from "@/components/categories/CategoryForm";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategorySkeleton } from "@/components/categories/CategorySkeleton";
import { ItemsPaginator } from "@/components/ItemsPaginator";
import { categoryService } from "@/services/categoryService";
import { slugify, dataUrlToFile } from "@/lib/utils";
import type { Category } from "@/types/models";
import type { PaginationMeta } from "@/types/pagination";

const PAGE_SIZE = 20;

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
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [openLimit, setOpenLimit] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CategoryFormValue>(emptyForm);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const limit = usePlanLimit("categories");
  const totalCount = meta?.total ?? 0;
  const atMax = limit !== undefined && totalCount >= limit;

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
      .index({ page: 1, per_page: PAGE_SIZE, addons: "products_count" })
      .then((res) => {
        setCats(res.data);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  };

  const loadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return;
    setLoadingMore(true);
    categoryService
      .index({
        page: meta.current_page + 1,
        per_page: PAGE_SIZE,
        addons: "products_count",
      })
      .then((res) => {
        setCats((prev) => [...prev, ...res.data]);
        setMeta(res.meta);
      })
      .finally(() => setLoadingMore(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    if (!form.name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }
    if (atMax) {
      setOpenLimit(true);
      return;
    }
    setCreating(true);
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
    } finally {
      setCreating(false);
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
        <h1 className="font-display font-bold text-2xl">
          {t("nav.categories")}
          {limit !== undefined && (
            <span className="pl-2 font-semibold text-[10px] text-muted-foreground">
              {totalCount} / {limit}
            </span>
          )}
        </h1>
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
          <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
            {cats.length}/{meta?.total ?? 0}
          </span>
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

      <ItemsPaginator
        loaded={cats.length}
        total={meta?.total ?? 0}
        hasMore={meta ? meta.current_page < meta.last_page : false}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />

      <button
        onClick={() => {
          if (atMax) {
            setOpenLimit(true);
            return;
          }
          setForm(emptyForm);
          setOpenCreate(true);
        }}
        className="fixed bottom-24 right-5 md:bottom-8 z-30 size-14 rounded-2xl gradient-brand shadow-pop grid place-items-center text-primary-foreground"
        aria-label={t("categories.new")}
      >
        <Plus className="size-7" />
      </button>

      <Dialog open={openLimit} onOpenChange={setOpenLimit}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <span className="size-14 grid place-items-center rounded-2xl gradient-brand shadow-pop text-primary-foreground">
              <Crown className="size-7" />
            </span>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {t("categories.limitTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("categories.limitSub")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full">
              <button
                onClick={() => setOpenLimit(false)}
                className="w-full h-11 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm shadow-pop"
              >
                {t("categories.limitOk")}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openCreate}
        onOpenChange={(o) => {
          if (creating && !o) return;
          setOpenCreate(o);
        }}
      >
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
                disabled={creating}
                className="px-4 h-11 rounded-2xl bg-muted font-semibold text-sm cursor-pointer disabled:opacity-60"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-5 h-11 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm shadow-pop cursor-pointer disabled:opacity-60"
              >
                {creating && <Loader2 className="size-4 animate-spin" />}
                {creating ? t("categories.creating") : t("categories.create")}
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
