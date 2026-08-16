import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Pencil,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import {
  Switch,
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
import { InfiniteScroll } from '@/components/InfiniteScroll'
import {
  useHybridRoles,
  useRolesCount,
  useToggleRoleStatus,
  useDeleteRole,
  isDefaultRole,
} from '@/hooks/useRoles'
import type { FilterStatus } from '@/hooks/useHybridFilter'
import { usePlanLimit } from '@/hooks/useAccount'
import { roleColor } from '@/lib/roleBrand'
import type { Role } from '@/types/models'

export const Route = createFileRoute('/_app/roles/')({ component: RolesPage })

function RolesPage() {
  const { t } = useI18n()
  const {
    items,
    total,
    q,
    setQ,
    status,
    setStatus,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
    isSkeleton,
  } = useHybridRoles()
  const { data: totalCountData } = useRolesCount()
  const toggleStatus = useToggleRoleStatus()
  const deleteRole = useDeleteRole()
  const limit = usePlanLimit('roles')

  const roles = items
  const totalCount = totalCountData ?? 0
  const atMax = limit !== undefined && totalCount >= limit

  const [toDelete, setToDelete] = useState<Role | null>(null)

  const tabs: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: t('roles.filterAll') },
    { value: 'active', label: t('roles.filterActive') },
    { value: 'inactive', label: t('roles.filterInactive') },
  ]

  const remove = async () => {
    if (!toDelete) return
    try {
      await deleteRole.mutateAsync(toDelete.uuid)
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
          {t('nav.roles')}
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
            placeholder={t('roles.search')}
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
                  ? 'gradient-brand text-primary-foreground shadow-pop'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
            {isSkeleton ? '—' : `${roles.length}/${total ?? 0}`}
          </span>
        </div>
      </div>

      <InfiniteScroll
        onLoadMore={() => fetchNextPage()}
        hasMore={hasMore}
        isLoading={isFetchingNextPage}
      >
        <ul className="px-5 mt-4 space-y-3">
          {isSkeleton &&
            Array.from({ length: 4 }).map((_, i) => <RoleSkeleton key={i} />)}
          {!isSkeleton && roles.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-12">
              {t('common.empty')}
            </li>
          )}
          {!isSkeleton &&
            roles.map((r) => {
              const color = roleColor(r.name)
              const locked = isDefaultRole(r)
              return (
                <li
                  key={r.uuid}
                  className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft"
                >
                  <div
                    className="size-14 rounded-2xl grid place-items-center shrink-0"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    <ShieldCheck className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {r.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 1
                                ? 'bg-primary/15 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {r.status === 1
                              ? t('roles.activeLabel')
                              : t('roles.inactiveLabel')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                            {r.scope === 'custom'
                              ? t('roles.scopeCustom')
                              : t('roles.scopeDefault')}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                          {r.permissions.length} {t('roles.permissionCount')} ·{' '}
                          {r.users_count ?? 0} {t('roles.usersCount')}
                        </p>
                      </div>
                      <Switch
                        checked={r.status === 1}
                        disabled={locked}
                        onCheckedChange={(v) =>
                          toggleStatus.mutate({ uuid: r.uuid, activate: v })
                        }
                        aria-label={t('roles.active')}
                      />
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <Link
                        to="/roles/$id"
                        params={{ id: r.uuid }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-semibold"
                      >
                        <Eye className="size-3" /> {t('common.view')}
                      </Link>
                      <Link
                        to="/roles/$id/edit"
                        params={{ id: r.uuid }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold"
                      >
                        <Pencil className="size-3" /> {t('common.edit')}
                      </Link>
                      <button
                        onClick={() => setToDelete(r)}
                        disabled={locked}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold ml-auto disabled:opacity-50"
                        aria-label={t('roles.deleteTitle')}
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

      <Link
        to="/roles/create"
        aria-label={t('roles.new')}
        className={`fixed bottom-24 right-5 md:bottom-8 z-30 size-14 rounded-2xl gradient-brand shadow-pop grid place-items-center text-primary-foreground ${
          atMax ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <Plus className="size-7" />
      </Link>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('roles.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('roles.deleteConfirm')}
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

function RoleSkeleton() {
  return (
    <li className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft">
      <div className="size-14 rounded-2xl bg-muted animate-pulse shrink-0" />
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
  )
}
