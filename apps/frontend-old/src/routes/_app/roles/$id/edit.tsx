import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { RoleForm } from '@/components/RoleForm'
import type { RoleFormValue } from '@/components/RoleForm'
import { SkeletonForm } from '@/components/skeletons'
import {
  useRole,
  useUpdateRole,
  useSyncRolePermissions,
  useToggleRoleStatus,
} from '@/hooks/useRoles'

export const Route = createFileRoute('/_app/roles/$id/edit')({
  component: EditRole,
})

function EditRole() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { id } = Route.useParams()
  const { data: role, isLoading, isError } = useRole(id)
  const updateRole = useUpdateRole(id)
  const syncPermissions = useSyncRolePermissions(id)
  const toggleStatus = useToggleRoleStatus()

  const [form, setForm] = useState<RoleFormValue | null>(null)

  useEffect(() => {
    if (role && form === null) {
      setForm({
        name: role.name,
        active: role.status === 1,
        permissionIds: role.permissions.map((p) => p.id),
      })
    }
  }, [role, form])

  if (isLoading) {
    return <SkeletonForm />
  }

  if (isError || !role) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('roles.notFound')}</p>
        <Link to="/roles" className="text-primary font-medium">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  if (!form) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error(t('roles.nameRequired'))
      return
    }
    try {
      await updateRole.mutateAsync({ name: form.name.trim() })
      const permsChanged =
        form.permissionIds.length !== role.permissions.length ||
        form.permissionIds.some(
          (p) => !role.permissions.some((rp) => rp.id === p),
        )
      if (permsChanged) {
        await syncPermissions.mutateAsync(form.permissionIds)
      }
      if (form.active !== (role.status === 1)) {
        await toggleStatus.mutateAsync({
          uuid: role.uuid,
          activate: form.active,
        })
      }
      nav({ to: '/roles/$id', params: { id: role.uuid } })
    } catch {
      // error handled by mutation toast
    }
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/roles/$id"
          params={{ id: role.uuid }}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t('roles.edit')}</h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <RoleForm value={form} onChange={setForm} />
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
