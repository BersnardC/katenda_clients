import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  KeyRound,
  CalendarDays,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Key } from '@/lib/i18n'
import { SkeletonView } from '@/components/skeletons'
import {
  useRole,
  useInfiniteRoles,
  useDeleteRole,
  usePermissions,
} from '@/hooks/useRoles'
import { groupPermissions } from '@/lib/permissions'
import { roleColor } from '@/lib/roleBrand'

export const Route = createFileRoute('/_app/roles/$id/')({
  component: RoleDetail,
})

function RoleDetail() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { id } = Route.useParams()
  const { data: role, isError, isLoading } = useRole(id)
  const { data } = useInfiniteRoles('all')
  const deleteRole = useDeleteRole()
  const { data: permissions = [] } = usePermissions()

  const groups = groupPermissions(permissions, (prefix) => {
    const key = `perms.${prefix}` as Key
    const label = t(key)
    return label === key ? prefix : label
  })

  if (isLoading) {
    return <SkeletonView tiles={3} aspect="aspect-[16/7]" />
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

  const color = roleColor(role.name)
  const poolRole = data?.pages
    .flatMap((p) => p.data)
    .find((r) => r.uuid === role.uuid)
  const usersCount = role.users_count ?? poolRole?.users_count ?? 0

  const remove = async () => {
    try {
      await deleteRole.mutateAsync(role.uuid)
      nav({ to: '/roles' })
    } catch {
      // error handled by mutation toast
    }
  }

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString('es', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—'

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
        <h1 className="font-display font-bold text-2xl flex-1 truncate">
          {role.name}
        </h1>
        <Link
          to="/roles/$id/edit"
          params={{ id: role.uuid }}
          className="size-10 grid place-items-center rounded-full bg-primary/15 text-primary"
          aria-label={t('common.edit')}
        >
          <Pencil className="size-4" />
        </Link>
      </header>

      <div className="px-5 space-y-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-soft flex gap-4">
          <div
            className="size-16 rounded-2xl grid place-items-center shrink-0"
            style={{ backgroundColor: `${color}22`, color }}
          >
            <ShieldCheck className="size-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-display font-bold text-lg truncate">
                {role.name}
              </p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  role.status === 1
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {role.status === 1
                  ? t('roles.activeLabel')
                  : t('roles.inactiveLabel')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {role.scope === 'custom'
                ? t('roles.scopeCustom')
                : t('roles.scopeDefault')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatTile
            icon={Users}
            label={t('roles.usersLabel')}
            value={String(usersCount)}
          />
          <StatTile
            icon={KeyRound}
            label={t('roles.permissionsLabel')}
            value={String(role.permissions.length)}
          />
          <StatTile
            icon={CalendarDays}
            label={t('roles.createdAtLabel')}
            value={formatDate(role.created_at)}
          />
        </div>

        <section>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {t('roles.permissions')}
          </p>
          <div className="space-y-3">
            {groups.map((g) => {
              const items = g.items.filter((it) =>
                role.permissions.some((p) => p.id === it.id),
              )
              if (items.length === 0) return null
              return (
                <div
                  key={g.prefix}
                  className="p-4 rounded-2xl bg-card border border-border"
                >
                  <p className="text-sm font-semibold mb-2">{g.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((it) => (
                      <span
                        key={it.id}
                        className="px-3 h-8 grid place-items-center rounded-full text-xs font-semibold bg-primary/15 text-primary"
                      >
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
            {role.permissions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('roles.permissionsEmpty')}
              </p>
            )}
          </div>
        </section>

        <div className="flex gap-2">
          <Link
            to="/roles/$id/edit"
            params={{ id: role.uuid }}
            className="flex-1 h-12 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop grid place-items-center"
          >
            <span className="flex items-center gap-2">
              <Pencil className="size-4" /> {t('common.edit')}
            </span>
          </Link>
          <button
            onClick={remove}
            className="h-12 px-5 rounded-2xl bg-destructive/15 text-destructive font-semibold flex items-center gap-2"
            aria-label={t('roles.deleteTitle')}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border text-center">
      <Icon className="size-4 mx-auto text-primary" />
      <p className="text-sm font-bold mt-1.5 truncate">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
