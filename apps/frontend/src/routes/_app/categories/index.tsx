import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Plus, Trash2, Eye, Pencil, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Switch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@katenda_clients/ui'
import { useI18n } from '@/lib/i18n'
import { CategoryForm } from '@/components/CategoryForm'
import type { CategoryFormValue } from '@/components/CategoryForm'
import { CategoryGlyph } from '@/components/CategoryGlyph'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import {
  useInfiniteCategories,
  useActiveCategoriesCount,
  useCreateCategory,
  useToggleCategoryStatus,
  useDeleteCategory,
  useUploadCategoryImage,
  useSetCategoryImage,
} from '@/hooks/useCategories'
import { usePlanLimit } from '@/hooks/useAccount'
import { slugify, dataUrlToFile } from '@/lib/utils'
import type { Category } from '@/types/models'

export const Route = createFileRoute('/_app/categories/')({
  component: CategoriesPage,
})

const emptyForm: CategoryFormValue = {
  name: '',
  image: null,
  icon: '🏷️',
  active: true,
  parentId: null,
}

function CategoriesPage() {
  const { t } = useI18n()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteCategories('all')
  const { data: activeTotalData } = useActiveCategoriesCount()
  const createCategory = useCreateCategory()
  const toggleStatus = useToggleCategoryStatus()
  const deleteCategory = useDeleteCategory()
  const uploadImage = useUploadCategoryImage()
  const setCategoryImage = useSetCategoryImage()
  const limit = usePlanLimit('categories')

  const categories = data?.pages.flatMap((p) => p.data) ?? []
  const activeTotal = activeTotalData ?? 0
  const atMax = limit !== undefined && activeTotal >= limit

  const [q, setQ] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [form, setForm] = useState<CategoryFormValue>(emptyForm)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const filtered = useMemo(
    () =>
      categories.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
    [categories, q],
  )

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error(t('categories.nameRequired'))
      return
    }
    try {
      const res = await createCategory.mutateAsync({
        name: form.name.trim(),
        slug: slugify(form.name),
        icon: form.icon || '🏷️',
        parent_id: form.parentId ?? undefined,
        status: form.active ? 1 : 0,
      })
      const uuid = res.data.category.uuid
      if (form.image && form.image.startsWith('data:')) {
        const file = await dataUrlToFile(form.image, 'categoria.jpg')
        const mediaRes = await uploadImage.mutateAsync({ uuid, file })
        const imageUrl = mediaRes.data.media[0]?.url
        if (imageUrl)
          await setCategoryImage.mutateAsync({ uuid, image_url: imageUrl })
      }
      setOpenCreate(false)
      setForm(emptyForm)
    } catch {
      // error handled by mutation toast
    }
  }

  const remove = async () => {
    if (!toDelete) return
    try {
      await deleteCategory.mutateAsync(toDelete.uuid)
      setToDelete(null)
    } catch {
      // error handled by mutation toast
    }
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">
          {t('nav.categories')}
        </h1>
      </header>

      {limit !== undefined && (
        <div
          className={`mx-5 mt-2 px-4 py-3 rounded-2xl border text-sm flex flex-wrap items-center gap-2 ${
            atMax
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-surface border-border text-muted-foreground'
          }`}
        >
          <span className="font-semibold">
            {activeTotal} / {limit} {t('nav.categories').toLowerCase()}
          </span>
          {atMax && <span>{t('categories.limitReached')}</span>}
        </div>
      )}

      <div className="px-5 mt-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('categories.search')}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <InfiniteScroll
        onLoadMore={() => fetchNextPage()}
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
      >
        <ul className="px-5 mt-4 space-y-3">
          {filtered.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-12">
              {t('common.empty')}
            </li>
          )}
          {filtered.map((c) => {
            const parent = c.parent_id
              ? categories.find((p) => p.id === c.parent_id)
              : null
            return (
              <li
                key={c.uuid}
                className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft"
              >
                <CategoryGlyph
                  category={c}
                  className="size-20 rounded-xl"
                  glyphClassName="text-3xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {parent
                          ? `↳ ${parent.name}`
                          : t('categories.rootLabel')}
                      </p>
                    </div>
                    <Switch
                      checked={c.status === 1}
                      onCheckedChange={(v) =>
                        toggleStatus.mutate({ uuid: c.uuid, activate: v })
                      }
                      aria-label={t('categories.active')}
                    />
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Link
                      to="/categories/$id"
                      params={{ id: c.uuid }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-semibold"
                    >
                      <Eye className="size-3" /> {t('common.view')}
                    </Link>
                    <Link
                      to="/categories/$id/edit"
                      params={{ id: c.uuid }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold"
                    >
                      <Pencil className="size-3" /> {t('common.edit')}
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
            )
          })}
        </ul>
      </InfiniteScroll>

      <button
        onClick={() => {
          setForm(emptyForm)
          setOpenCreate(true)
        }}
        disabled={atMax}
        className="fixed bottom-24 right-5 md:bottom-8 z-30 size-14 rounded-2xl gradient-brand shadow-pop grid place-items-center text-primary-foreground disabled:opacity-50"
        aria-label={t('categories.new')}
      >
        <Plus className="size-7" />
      </button>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('categories.new')}</DialogTitle>
            <DialogDescription>{t('categories.newSub')}</DialogDescription>
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
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 h-11 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm shadow-pop"
              >
                {t('categories.create')}
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
            <AlertDialogTitle>{t('categories.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('categories.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-destructive text-destructive-foreground"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
