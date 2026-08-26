import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { UserDetailSkeleton } from "@/components/users/UserDetailSkeleton";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { userService } from "@/services/userService";
import type { User } from "@/types/models";

export function Component() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    let alive = true;
    userService
      .show(uuid)
      .then((res) => {
        if (alive) setUser(res.data);
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
    return <UserDetailSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("users.notFound")}</p>
        <Link to="/users" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const roleName =
    user.roles?.find((r) => r.id === user.role_id)?.name ?? t("users.noRole");
  const active = user.status === 1;
  const initial = user.name.trim().charAt(0).toUpperCase();
  const createdLabel = new Date(user.created_at).toLocaleDateString(
    lang === "es" ? "es" : "en",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const stats = [
    { icon: Mail, label: t("users.emailLabel"), value: user.email },
    { icon: ShieldCheck, label: t("users.role"), value: roleName },
    { icon: CalendarDays, label: t("users.createdLabel"), value: createdLabel },
  ];

  const remove = async () => {
    try {
      await userService.destroy(user.uuid);
      toast.success(t("users.deleted"));
      navigate("/users");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("users.deleteError"),
      );
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/users"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl truncate">
          {user.name}
        </h1>
      </header>

      <div className="px-5 space-y-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-soft flex gap-4 items-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="size-20 rounded-full object-cover bg-muted shrink-0"
            />
          ) : (
            <div className="size-20 rounded-full grid place-items-center shrink-0 text-3xl font-bold bg-primary/15 text-primary">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <span
              className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                active
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {active ? t("users.activeLabel") : t("users.inactiveLabel")}
            </span>
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

        <div className="flex gap-3">
          <Link
            to={`/users/${user.uuid}/edit`}
            className="flex-1 h-12 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop flex items-center justify-center gap-2"
          >
            <Pencil className="size-4" /> {t("common.edit")}
          </Link>
          <button
            onClick={() => setOpenDelete(true)}
            className="h-12 px-5 rounded-2xl bg-destructive/15 text-destructive font-semibold flex items-center gap-2"
          >
            <Trash2 className="size-4" /> {t("users.deleteTitle")}
          </button>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={t("users.deleteTitle")}
        description={t("users.deleteConfirm").replace("{name}", user.name)}
        onConfirm={remove}
      />
    </>
  );
}
