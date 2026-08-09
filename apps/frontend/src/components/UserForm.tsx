import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@katenda_clients/ui'
import { useI18n } from '@/lib/i18n'
import type { Role } from '@/types/models'

export type UserFormValue = {
  name: string
  email: string
  password: string
  roleId: number | null
  active: boolean
  sendInvitation: boolean
}

export function UserForm({
  value,
  onChange,
  roles,
  mode,
}: {
  value: UserFormValue
  onChange: (v: UserFormValue) => void
  roles: Role[]
  mode: 'create' | 'edit'
}) {
  const { t } = useI18n()

  const set = (patch: Partial<UserFormValue>) =>
    onChange({ ...value, ...patch })

  const readonly = mode === 'edit'

  const inputCls =
    'w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm'

  return (
    <div className="space-y-4">
      {mode === 'edit' && (
        <div>
          <p className="text-sm font-medium mb-1.5">{t('users.name')}</p>
          <input
            value={value.name}
            readOnly
            disabled
            className={`${inputCls} opacity-70`}
          />
        </div>
      )}

      {mode === 'create' && (
        <div>
          <p className="text-sm font-medium mb-1.5">{t('users.name')}</p>
          <input
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={t('users.namePlaceholder')}
            className={inputCls}
          />
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-1.5">{t('users.email')}</p>
        <input
          type="email"
          value={value.email}
          readOnly={readonly}
          disabled={readonly}
          onChange={(e) => set({ email: e.target.value })}
          className={`${inputCls} ${readonly ? 'opacity-70' : ''}`}
        />
      </div>

      {mode === 'create' && (
        <div>
          <p className="text-sm font-medium mb-1.5">{t('users.password')}</p>
          <input
            type="password"
            value={value.password}
            onChange={(e) => set({ password: e.target.value })}
            placeholder={t('users.passwordPlaceholder')}
            className={inputCls}
          />
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-1.5">{t('users.role')}</p>
        <Select
          value={value.roleId ? String(value.roleId) : undefined}
          onValueChange={(v) => set({ roleId: Number(v) })}
        >
          <SelectTrigger className="w-full h-12 rounded-2xl bg-surface border-border">
            <SelectValue placeholder={t('users.selectRole')} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.uuid} value={String(r.id)}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mode === 'create' && (
        <div className="flex items-center gap-3 px-4 h-16 rounded-2xl bg-card border border-border">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{t('users.inviteNote')}</p>
            <p className="text-xs text-muted-foreground">
              {t('users.inviteNoteSub')}
            </p>
          </div>
          <Switch
            checked={value.sendInvitation}
            onCheckedChange={(v) => set({ sendInvitation: v })}
          />
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border">
          <div className="flex-1">
            <p className="font-medium text-sm">{t('users.active')}</p>
            <p className="text-xs text-muted-foreground">
              {t('users.activeSub')}
            </p>
          </div>
          <Switch
            checked={value.active}
            onCheckedChange={(v) => set({ active: v })}
          />
        </div>
      )}
    </div>
  )
}
