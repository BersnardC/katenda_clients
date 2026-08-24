import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";
import { groupPermissions } from "@/components/roles/permissionGroups";
import type { Permission } from "@/types/models";

export type RoleFormValue = {
  name: string;
  permission_ids: number[];
};

const MODULE_LABELS: Record<string, Key> = {
  stores: "roles.module.stores",
  products: "roles.module.products",
  categories: "roles.module.categories",
  users: "roles.module.users",
  roles: "roles.module.roles",
  subscription: "roles.module.subscription",
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

  const moduleLabel = (key: string) =>
    key in MODULE_LABELS
      ? t(MODULE_LABELS[key])
      : key.charAt(0).toUpperCase() + key.slice(1);

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
          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={() =>
                set({
                  permission_ids: groups.flatMap((g) =>
                    g.items.map((p) => p.id),
                  ),
                })
              }
              className="text-xs font-semibold text-primary flex items-center gap-1"
            >
              <Check className="size-3" /> {t("roles.selectAll")}
            </button>
          </div>
        </div>
        {groups.map((g) => {
          const groupIds = g.items.map((p) => p.id);
          const allSelected =
            groupIds.length > 0 &&
            groupIds.every((id) => value.permission_ids.includes(id));
          return (
            <div
              key={g.key}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">{moduleLabel(g.key)}</p>
                <button
                  type="button"
                  onClick={() =>
                    set({
                      permission_ids: allSelected
                        ? value.permission_ids.filter(
                            (id) => !groupIds.includes(id),
                          )
                        : Array.from(
                            new Set([...value.permission_ids, ...groupIds]),
                          ),
                    })
                  }
                  className={`text-[11px] font-semibold px-2.5 h-6 rounded-full border transition flex items-center gap-1 ${
                    allSelected
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-muted text-muted-foreground border-transparent hover:border-border"
                  }`}
                >
                  {allSelected ? (
                    <>
                      <X className="size-3" /> {t("roles.selectNone")}
                    </>
                  ) : (
                    <>
                      <Check className="size-3" /> {t("roles.selectAll")}
                    </>
                  )}
                </button>
              </div>
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
          );
        })}
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {t("common.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
