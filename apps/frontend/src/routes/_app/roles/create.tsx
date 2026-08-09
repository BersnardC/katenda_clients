import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { RoleForm } from '@/components/RoleForm'
import type { RoleFormValue } from '@/components/RoleForm'
import { useCreateRole, useRolesCount } from '@/hooks/useRoles'
import { usePlanLimit } from '@/hooks/useAccount'

export const Route = createFileRoute('/_app/roles/create')({
  component: CreateRole,
})

const emptyForm: RoleFormValue = { name: '', active: true, permissionIds: [] }

function CreateRole() {
  const { t } = useI18n()
  const nav = useNavigate()
  const createRole = useCreateRole()
  const { data: totalCountData } = useRolesCount()
  const limit = usePlanLimit('roles')
  const totalCount = totalCountData ?? 0
  const atMax = limit !== undefined && totalCount >= limit

  const [form, setForm] = useState<RoleFormValue>(emptyForm)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error(t('roles.nameRequired'))
      return
    }
    if (atMax) {
      toast.error(t('roles.limitReached'))
      return
    }
    try {
      await createRole.mutateAsync({
        name: form.name.trim(),
        permission_ids: form.permissionIds,
      })
      nav({ to: '/roles' })
    } catch {
      // error handled by mutation toast
    }
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/roles"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t('roles.new')}</h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <RoleForm value={form} onChange={setForm} />
        <button
          type="submit"
          className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
        >
          {t('roles.create')}
        </button>
      </form>
    </>
  )
}
