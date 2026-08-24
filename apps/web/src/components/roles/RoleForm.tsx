import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { groupPermissions } from "@/components/roles/permissionGroups";
import type { Permission } from "@/types/models";

export type RoleFormValue = {
  name: string;
  permission_ids: number[];
};

export function RoleForm({
  value,
  onChange,
  permissions,
}: {
  value: RoleFormValue;
  onChange: (v: RoleFormValue) => void;
  permissions: Permission[];
}) {
  const { t } = useI18n();

  const set = (patch: Partial<RoleFormValue>) =>
    onChange({ ...value, ...patch });

  const togglePerm = (id: number) =>
    set({
      permission_ids: value.permission_ids.includes(id)
        ? value.permission_ids.filter((x) => x !== id)
        : [...value.permission_ids, id],
    });

  const groups = useMemo(() => groupPermissions(permissions), [permissions]);

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">
          {t("roles.name")}
        </label>
        <input
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          maxLength={60}
          placeholder="Ej. Editor"
          className={inputCls}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            {t("roles.permissions")}
          </p>
          {value.permission_ids.length > 0 && (
            <button
              type="button"
              onClick={() => set({ permission_ids: [] })}
              className="text-xs font-semibold text-muted-foreground flex items-center gap-1"
            >
              <X className="size-3" /> {t("roles.clearPerms")} (
              {value.permission_ids.length})
            </button>
          )}
        </div>
        {groups.map((g) => (
          <div
            key={g.key}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <p className="text-sm font-semibold mb-2">{g.label}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((p) => {
                const on = value.permission_ids.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePerm(p.id)}
                    aria-pressed={on}
                    className={`flex items-center gap-1 px-3 h-8 rounded-full text-xs font-semibold transition ${
                      on
                        ? "bg-primary/15 text-primary border border-primary/40"
                        : "bg-muted text-muted-foreground border border-transparent"
                    }`}
                  >
                    {on && <Check className="size-3" />}
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {t("common.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
