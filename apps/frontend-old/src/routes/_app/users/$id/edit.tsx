import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { UserForm } from '@/components/UserForm'
import type { UserFormValue } from '@/components/UserForm'
import { SkeletonForm } from '@/components/skeletons'
import {
  useAccountUser,
  useUpdateUserRole,
  useToggleUserStatus,
} from '@/hooks/useUsers'
import { useInfiniteRoles } from '@/hooks/useRoles'

export const Route = createFileRoute('/_app/users/$id/edit')({
  component: EditUser,
})

function EditUser() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { id } = Route.useParams()
  const { data: user, isLoading, isError } = useAccountUser(id)
  const updateUserRole = useUpdateUserRole(id)
  const toggleStatus = useToggleUserStatus()
  const { data } = useInfiniteRoles('all')
  const roles = data?.pages.flatMap((p) => p.data) ?? []

  const [form, setForm] = useState<UserFormValue | null>(null)

  useEffect(() => {
    if (user && form === null) {
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        roleId: user.pivot.role_id,
        active: user.pivot.status === 1,
        sendInvitation: true,
      })
    }
  }, [user, form])

  if (isLoading) {
    return <SkeletonForm fields={4} />
  }

  if (isError || !user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('users.notFound')}</p>
        <Link to="/users" className="text-primary font-medium">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  if (!form) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.roleId) {
      toast.error(t('users.roleRequired'))
      return
    }
    try {
      if (form.roleId !== user.pivot.role_id) {
        await updateUserRole.mutateAsync(form.roleId)
      }
      if (form.active !== (user.pivot.status === 1)) {
        await toggleStatus.mutateAsync({
          uuid: user.uuid,
          activate: form.active,
        })
      }
      nav({ to: '/users/$id', params: { id: user.uuid } })
    } catch {
      // error handled by mutation toast
    }
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/users/$id"
          params={{ id: user.uuid }}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t('users.edit')}</h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <UserForm value={form} onChange={setForm} roles={roles} mode="edit" />
        <div className="flex gap-2 pt-2">
          <Link
            to="/users/$id"
            params={{ id: user.uuid }}
            className="flex-1 h-12 grid place-items-center rounded-2xl bg-muted font-semibold text-sm"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            className="flex-1 h-12 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm shadow-pop"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </>
  )
}
