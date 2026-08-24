import { Link } from "react-router-dom";
import { Trash2, Eye, Pencil, ShieldCheck } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import type { Role } from "@/types/models";

const DEFAULT_ROLES = ["owner", "admin", "manager"];

export function RoleCard({
  role,
  onToggle,
  onDelete,
}: {
  role: Role;
  onToggle: (r: Role, activate: boolean) => void;
  onDelete: (r: Role) => void;
}) {
  const { t } = useI18n();
  const isDefault = DEFAULT_ROLES.includes(role.name);
  const perms = role.permissions?.length ?? 0;

  return (
    <li className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft">
      <div className="size-14 rounded-2xl grid place-items-center shrink-0 bg-primary/15 text-primary">
        <ShieldCheck className="size-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm truncate">{role.name}</p>
              {isDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground shrink-0">
                  {t("roles.defaultLabel")}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  role.status === 1
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {role.status === 1
                  ? t("roles.activeLabel")
                  : t("roles.inactiveLabel")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {role.scope}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
              {perms} {t("roles.permCount")} · {role.users_count ?? 0}{" "}
              {t("roles.users")}
            </p>
          </div>
          <Switch
            checked={role.status === 1}
            onCheckedChange={(v) => onToggle(role, v)}
            disabled={isDefault}
            aria-label={t("roles.active")}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Link
            to={`/roles/${role.uuid}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-semibold"
            aria-label={`Ver ${role.name}`}
          >
            <Eye className="size-3" /> {t("common.view")}
          </Link>
          <Link
            to={`/roles/${role.uuid}/edit`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold"
            aria-label={`Editar ${role.name}`}
          >
            <Pencil className="size-3" /> {t("common.edit")}
          </Link>
          {!isDefault && (
            <button
              onClick={() => onDelete(role)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold ml-auto"
              aria-label={`Eliminar ${role.name}`}
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
