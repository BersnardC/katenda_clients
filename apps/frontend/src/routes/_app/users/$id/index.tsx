import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  BadgeCheck,
  ShieldAlert,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Key } from '@/lib/i18n'
import { SkeletonView } from '@/components/skeletons'
import { useAccountUser, useRemoveUser } from '@/hooks/useUsers'
import { useHybridRoles } from '@/hooks/useRoles'
import { groupPermissions } from '@/lib/permissions'

export const Route = createFileRoute('/_app/users/$id/')({
  component: UserDetail,
})

function UserDetail() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { id } = Route.useParams()
  const { data: user, isError, isLoading } = useAccountUser(id)
  const removeUser = useRemoveUser()
  const { items: roles } = useHybridRoles()

  if (isLoading) {
    return <SkeletonView tiles={3} aspect="aspect-[5/3]" />
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

  const role = roles.find((r) => r.id === user.pivot.role_id)
  const verified = !!user.email_verified_at
  const initials = user.name.trim().charAt(0).toUpperCase()

  const groups = role
    ? groupPermissions(role.permissions, (prefix) => {
        const key = `perms.${prefix}` as Key
        const label = t(key)
        return label === key ? prefix : label
      })
    : []

  const remove = async () => {
    try {
      await removeUser.mutateAsync(user.uuid)
      nav({ to: '/users' })
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
          to="/users"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl flex-1 truncate">
          {user.name}
        </h1>
        <Link
          to="/users/$id/edit"
          params={{ id: user.uuid }}
          className="size-10 grid place-items-center rounded-full bg-primary/15 text-primary"
          aria-label={t('common.edit')}
        >
          <Pencil className="size-4" />
        </Link>
      </header>

      <div className="px-5 space-y-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-soft flex gap-4 items-center">
          <div className="size-20 rounded-full grid place-items-center shrink-0 text-3xl font-bold bg-primary/15 text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-lg truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.pivot.status === 1
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {user.pivot.status === 1
                  ? t('users.activeLabel')
                  : t('users.inactiveLabel')}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  verified
                    ? 'bg-success/20 text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {verified ? (
                  <BadgeCheck className="size-3" />
                ) : (
                  <ShieldAlert className="size-3" />
                )}
                {verified ? t('users.verified') : t('users.unverified')}
              </span>
              {role && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent-foreground">
                  {role.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3">
          <Tile
            label={t('users.statusLabel')}
            value={
              user.pivot.status === 1
                ? t('users.activeLabel')
                : t('users.inactiveLabel')
            }
          />
          <Tile label={t('users.roleLabel')} value={role?.name ?? '—'} />
          <Tile
            label={t('users.verified')}
            value={verified ? t('users.verified') : t('users.unverified')}
          />
          <Tile
            label={t('users.memberSince')}
            value={formatDate(user.pivot.created_at ?? user.created_at)}
          />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-display font-bold text-lg">
              {t('users.role')}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-sm font-semibold">{role?.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('users.roleReadonly')}
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-display font-bold text-lg">
              {t('users.permissions')}
            </h2>
            <span className="text-xs text-muted-foreground">
              {role?.permissions.length ?? 0}
            </span>
          </div>
          {role && role.permissions.length > 0 ? (
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
                          className="px-3 h-8 grid place-items-center rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30"
                        >
                          {it.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground rounded-2xl border border-dashed border-border">
              {t('users.permissionsEmpty')}
            </p>
          )}
        </section>

        <button
          onClick={remove}
          className="w-full py-4 rounded-2xl bg-destructive/15 text-destructive font-semibold flex items-center justify-center gap-2"
        >
          <Trash2 className="size-4" /> {t('users.deleteTitle')}
        </button>
      </div>
    </>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-sm font-semibold mt-0.5 truncate">{value}</p>
    </div>
  )
}
