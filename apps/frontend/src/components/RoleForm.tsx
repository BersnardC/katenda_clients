import { Check, X } from 'lucide-react'
import { Switch } from '@katenda_clients/ui'
import { useI18n } from '@/lib/i18n'
import type { Key } from '@/lib/i18n'
import { usePermissions } from '@/hooks/useRoles'
import { groupPermissions } from '@/lib/permissions'

export type RoleFormValue = {
  name: string
  active: boolean
  permissionIds: number[]
}

export function RoleForm({
  value,
  onChange,
}: {
  value: RoleFormValue
  onChange: (v: RoleFormValue) => void
}) {
  const { t } = useI18n()
  const { data: permissions = [] } = usePermissions()

  const set = (patch: Partial<RoleFormValue>) =>
    onChange({ ...value, ...patch })

  const groups = groupPermissions(permissions, (prefix) => {
    const key = `perms.${prefix}` as Key
    const label = t(key)
    return label === key ? prefix : label
  })

  const togglePermission = (id: number) => {
    set({
      permissionIds: value.permissionIds.includes(id)
        ? value.permissionIds.filter((p) => p !== id)
        : [...value.permissionIds, id],
    })
  }

  const inputCls =
    'w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm'

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-1.5">{t('roles.name')}</p>
        <input
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder={t('roles.namePlaceholder')}
          maxLength={255}
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium">{t('roles.permissions')}</p>
          {value.permissionIds.length > 0 && (
            <button
              type="button"
              onClick={() => set({ permissionIds: [] })}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"
            >
              <X className="size-3" /> {t('roles.clearPermissions')} (
              {value.permissionIds.length})
            </button>
          )}
        </div>
        <div className="space-y-3">
          {groups.map((g) => (
            <div
              key={g.prefix}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <p className="text-sm font-semibold mb-2">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((p) => {
                  const on = value.permissionIds.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => togglePermission(p.id)}
                      className={`flex items-center gap-1 px-3 h-8 rounded-full text-xs font-semibold transition ${
                        on
                          ? 'bg-primary/15 text-primary border border-primary/40'
                          : 'bg-muted text-muted-foreground border border-transparent'
                      }`}
                    >
                      {on && <Check className="size-3" />}
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('roles.permissionsEmpty')}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border">
        <div className="flex-1">
          <p className="font-medium text-sm">{t('roles.active')}</p>
          <p className="text-xs text-muted-foreground">
            {t('roles.activeSub')}
          </p>
        </div>
        <Switch
          checked={value.active}
          onCheckedChange={(v) => set({ active: v })}
        />
      </div>
    </div>
  )
}
