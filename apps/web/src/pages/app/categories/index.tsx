import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Eye, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@katenda_clients/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@katenda_clients/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@katenda_clients/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { CategoryForm, type CategoryFormValue } from "@/components/categories/CategoryForm";
import { DynamicIcon } from "@/components/IconPicker";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import {
  useHybridCategories,
  useCategoriesCount,
} from "@/hooks/useCategories";
import { categoryService } from "@/services/categoryService";
import { usePlanLimit } from "@/hooks/useAccount";
import { slugify, dataUrlToFile } from "@/lib/utils";
import type { Category } from "@/types/models";

const emptyForm: CategoryFormValue = {
  name: "",
  image: null,
  icon: "Tag",
  active: true,
  parentId: null,
};

export function Component() {
  const { t } = useI18n();
  const {
    items: categories,
    total,
    q,
    setQ,
    status,
    setStatus,
    hasMore,
    loadMore,
    loading: isSkeleton,
    loadingMore,
    refetch,
  } = useHybridCategories();
  const { data: countData } = useCategoriesCount();
  const limit = usePlanLimit("categories");
  const totalCount = countData?.meta.total ?? 0;
  const atMax = limit !== undefined && totalCount >= limit;

  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState<CategoryFormValue>(emptyForm);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const tabs: { value: "all" | "active" | "inactive"; label: string }[] = [
    { value: "all", label: t("categories.filterAll") },
    { value: "active", label: t("categories.filterActive") },
    { value: "inactive", label: t("categories.filterInactive") },
  ];

  const errMsg = (e: unknown, fallback: string) =>
    e instanceof Error && e.message ? e.message : fallback;

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }
    if (atMax) {
      toast.error(t("categories.limitReached"));
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
      const uuid = res.data.uuid;
      if (form.image && form.image.startsWith("data:")) {
        const file = await dataUrlToFile(form.image, "categoria.jpg");
        await categoryService.uploadImage(uuid, file);
      }
      toast.success(t("categories.created"));
      setOpenCreate(false);
      setForm(emptyForm);
      refetch();
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
      refetch();
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
      refetch();
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
            {isSkeleton ? "—" : `${categories.length}/${total ?? 0}`}
          </span>
        </div>
      </div>

      <InfiniteScroll
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={loadingMore}
      >
        <ul className="px-5 mt-4 space-y-3">
          {isSkeleton &&
            Array.from({ length: 5 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          {!isSkeleton && categories.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-12">
              {t("common.empty")}
            </li>
          )}
          {!isSkeleton &&
            categories.map((c) => {
              const parent = c.parent_id
                ? categories.find((p) => p.id === c.parent_id)
                : null;
              return (
                <li
                  key={c.uuid}
                  className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft"
                >
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
                        <p className="font-semibold text-sm truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {parent
                            ? `↳ ${parent.name}`
                            : t("categories.rootLabel")}
                          {c.products_count !== undefined &&
                            ` · ${c.products_count} ${t("categories.products")}`}
                        </p>
                      </div>
                      <Switch
                        checked={c.status === 1}
                        onCheckedChange={(v) => toggle(c, v)}
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
                        onClick={() => setToDelete(c)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold ml-auto"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </InfiniteScroll>

      <button
        onClick={() => {
          setForm(emptyForm);
          setOpenCreate(true);
        }}
        disabled={atMax}
        className="fixed bottom-24 right-5 md:bottom-8 z-30 size-14 rounded-2xl gradient-brand shadow-pop grid place-items-center text-primary-foreground disabled:opacity-50"
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
            <CategoryForm
              value={form}
              onChange={setForm}
              categories={categories}
            />
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

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("categories.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-destructive text-destructive-foreground"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CategorySkeleton() {
  return (
    <li className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft">
      <div className="size-20 rounded-xl bg-muted animate-pulse" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-3/4 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-6 w-11 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="mt-2 flex gap-1.5">
          <div className="h-6 w-14 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-16 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-8 rounded-lg bg-muted animate-pulse ml-auto" />
        </div>
      </div>
    </li>
  );
}
