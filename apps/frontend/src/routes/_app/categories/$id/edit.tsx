import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { CategoryForm } from '@/components/CategoryForm'
import type { CategoryFormValue } from '@/components/CategoryForm'
import { SkeletonForm } from '@/components/skeletons'
import {
  useCategory,
  useInfiniteCategories,
  useUpdateCategory,
  useUploadCategoryImage,
  useRemoveCategoryImage,
} from '@/hooks/useCategories'
import { slugify, dataUrlToFile } from '@/lib/utils'

export const Route = createFileRoute('/_app/categories/$id/edit')({
  component: EditCategory,
})

function EditCategory() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { id } = Route.useParams()
  const { data: category, isLoading, isError } = useCategory(id)
  const { data } = useInfiniteCategories('all')
  const updateCategory = useUpdateCategory(id)
  const uploadImage = useUploadCategoryImage()
  const removeImage = useRemoveCategoryImage()
  const categories = data?.pages.flatMap((p) => p.data) ?? []

  const [form, setForm] = useState<CategoryFormValue | null>(null)

  useEffect(() => {
    if (category && form === null) {
      setForm({
        name: category.name,
        image: category.image_url,
        icon: category.icon || 'Tag',
        active: category.status === 1,
        parentId: category.parent_id,
      })
    }
  }, [category, form])

  if (isLoading) {
    return <SkeletonForm />
  }

  if (isError || !category) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('categories.notFound')}</p>
        <Link to="/categories" className="text-primary font-medium">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  if (!form) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error(t('categories.nameRequired'))
      return
    }
    try {
      await updateCategory.mutateAsync({
        name: form.name.trim(),
        slug: slugify(form.name),
        icon: form.icon || 'Tag',
        parent_id: form.parentId ?? undefined,
        status: form.active ? 1 : 0,
      })
      if (form.image && form.image.startsWith('data:')) {
        const file = await dataUrlToFile(form.image, 'categoria.jpg')
        await uploadImage.mutateAsync({
          uuid: category.uuid,
          file,
        })
      } else if (form.image === null && category.image_url) {
        await removeImage.mutateAsync(category.uuid)
      }
      nav({ to: '/categories/$id', params: { id: category.uuid } })
    } catch {
      // error handled by mutation toast
    }
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/categories/$id"
          params={{ id: category.uuid }}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">
          {t('categories.edit')}
        </h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <CategoryForm
          value={form}
          onChange={setForm}
          categories={categories}
          excludeId={category.id}
        />
        <button
          type="submit"
          className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
        >
          {t('common.save')}
        </button>
      </form>
    </>
  )
}
