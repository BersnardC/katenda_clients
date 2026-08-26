import { Link } from "react-router-dom";
import { Trash2, Eye, Pencil } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import type { User } from "@/types/models";

export function UserCard({
  user,
  onToggle,
  onDelete,
}: {
  user: User;
  onToggle: (u: User, activate: boolean) => void;
  onDelete: (u: User) => void;
}) {
  const { t } = useI18n();
  const roleName =
    user.roles?.find((r) => r.id === user.role_id)?.name ?? "";
  const active = user.status === 1;
  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <li className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="size-14 rounded-full object-cover bg-muted shrink-0"
        />
      ) : (
        <div className="size-14 rounded-full grid place-items-center shrink-0 text-xl font-bold bg-primary/15 text-primary">
          {initial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {active ? t("users.activeLabel") : t("users.inactiveLabel")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            {roleName && (
              <p className="text-xs text-muted-foreground truncate">
                {roleName}
              </p>
            )}
          </div>
          <Switch
            checked={active}
            onCheckedChange={(v) => onToggle(user, v)}
            aria-label={t("users.active")}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Link
            to={`/users/${user.uuid}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-semibold"
            aria-label={`Ver ${user.name}`}
          >
            <Eye className="size-3" /> {t("common.view")}
          </Link>
          <Link
            to={`/users/${user.uuid}/edit`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold"
            aria-label={`Editar ${user.name}`}
          >
            <Pencil className="size-3" /> {t("common.edit")}
          </Link>
          <button
            onClick={() => onDelete(user)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold ml-auto"
            aria-label={`Eliminar ${user.name}`}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>
    </li>
  );
}
