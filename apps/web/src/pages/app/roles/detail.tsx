import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  KeyRound,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { RoleDetailSkeleton } from "@/components/roles/RoleDetailSkeleton";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { groupPermissions } from "@/components/roles/permissionGroups";
import { roleService } from "@/services/roleService";
import type { Role } from "@/types/models";

export function Component() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    let alive = true;
    roleService
      .show(uuid, { addons: "users_count" })
      .then((res) => {
        if (alive) setRole(res.data);
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [uuid]);

  if (loading) {
    return <RoleDetailSkeleton />;
  }

  if (error || !role) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("roles.notFound")}</p>
        <Link to="/roles" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const perms = role.permissions ?? [];
  const groups = groupPermissions(perms);
  const createdLabel = new Date(role.created_at).toLocaleDateString(
    lang === "es" ? "es" : "en",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const stats = [
    { icon: Users, label: t("roles.users"), value: role.users_count ?? 0 },
    { icon: KeyRound, label: t("roles.permissionsLabel"), value: perms.length },
    { icon: CalendarDays, label: t("roles.createdLabel"), value: createdLabel },
  ];

  const remove = async () => {
    try {
      await roleService.destroy(role.uuid);
      toast.success(t("roles.deleted"));
      navigate("/roles");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("roles.deleteError"),
      );
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/roles"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl truncate">
          {role.name}
        </h1>
      </header>

      <div className="px-5 space-y-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-soft flex gap-4">
          <div className="size-16 rounded-2xl grid place-items-center shrink-0 bg-primary/15 text-primary">
            <ShieldCheck className="size-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{role.name}</p>
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
            <p className="text-xs text-muted-foreground font-mono">
              {role.scope}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-2xl bg-card border border-border text-center"
            >
              <s.icon className="size-4 mx-auto text-primary" />
              <p className="mt-1 text-sm font-bold truncate">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">
            {t("roles.permissions")}
          </p>
          {groups.map((g) => {
            const items = perms.filter((p) =>
              g.items.some((gp) => gp.id === p.id),
            );
            if (items.length === 0) return null;
            return (
              <div
                key={g.key}
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
            );
          })}
          {perms.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("roles.noPerms")}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            to={`/roles/${role.uuid}/edit`}
            className="flex-1 h-12 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop flex items-center justify-center gap-2"
          >
            <Pencil className="size-4" /> {t("common.edit")}
          </Link>
          <button
            onClick={() => setOpenDelete(true)}
            className="h-12 px-5 rounded-2xl bg-destructive/15 text-destructive font-semibold flex items-center gap-2"
          >
            <Trash2 className="size-4" /> {t("roles.deleteTitle")}
          </button>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={t("roles.deleteTitle")}
        description={t("roles.deleteConfirm")}
        onConfirm={remove}
      />
    </>
  );
}
