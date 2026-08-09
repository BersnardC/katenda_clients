import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { UserForm } from '@/components/UserForm'
import type { UserFormValue } from '@/components/UserForm'
import { useCreateUser, useUsersCount } from '@/hooks/useUsers'
import { useInfiniteRoles } from '@/hooks/useRoles'
import { usePlanLimit } from '@/hooks/useAccount'

export const Route = createFileRoute('/_app/users/create')({
  component: CreateUser,
})

function CreateUser() {
  const { t } = useI18n()
  const nav = useNavigate()
  const createUser = useCreateUser()
  const { data: totalCountData } = useUsersCount()
  const limit = usePlanLimit('users')
  const { data } = useInfiniteRoles('all')
  const roles = data?.pages.flatMap((p) => p.data) ?? []

  const atMax = limit !== undefined && (totalCountData ?? 0) >= limit

  const [form, setForm] = useState<UserFormValue>({
    name: '',
    email: '',
    password: '',
    roleId: null,
    active: true,
    sendInvitation: true,
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (atMax) {
      toast.error(t('users.limitReached'))
      return
    }
    if (!form.name.trim()) {
      toast.error(t('users.nameRequired'))
      return
    }
    if (!form.email.trim()) {
      toast.error(t('users.emailRequired'))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error(t('users.invalidEmail'))
      return
    }
    if (!form.password) {
      toast.error(t('users.passwordRequired'))
      return
    }
    if (form.password.length < 8) {
      toast.error(t('users.minPassword'))
      return
    }
    if (!form.roleId) {
      toast.error(t('users.roleRequired'))
      return
    }
    try {
      await createUser.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role_id: form.roleId,
        send_invitation: form.sendInvitation,
      })
      nav({ to: '/users' })
    } catch {
      // error handled by mutation toast
    }
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/users"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t('users.new')}</h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <UserForm value={form} onChange={setForm} roles={roles} mode="create" />
        <div className="flex gap-2 pt-2">
          <Link
            to="/users"
            className="flex-1 h-12 grid place-items-center rounded-2xl bg-muted font-semibold text-sm"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={atMax}
            className="flex-1 h-12 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm shadow-pop disabled:opacity-50"
          >
            {t('users.create')}
          </button>
        </div>
      </form>
    </>
  )
}
