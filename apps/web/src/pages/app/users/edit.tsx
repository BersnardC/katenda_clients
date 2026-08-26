import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import {
  UserForm,
  type UserFormValue,
} from "@/components/users/UserForm";
import { UserFormSkeleton } from "@/components/users/UserFormSkeleton";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import type { Role, User } from "@/types/models";

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState<UserFormValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    userService
      .show(uuid)
      .then((res) => {
        if (!alive) return;
        setUser(res.data);
        setForm({
          name: res.data.name,
          email: res.data.email,
          password: "",
          role_id: res.data.role_id ?? null,
        });
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    roleService
      .index({ page: 1, per_page: 100 })
      .then((res) => {
        if (alive) setRoles(res.data);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [uuid]);

  if (loading) {
    return <UserFormSkeleton />;
  }

  if (error || !user || !form) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("users.notFound")}</p>
        <Link to="/users" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.role_id) {
      toast.error(t("users.roleRequired"));
      return;
    }
    setSaving(true);
    try {
      await userService.update(user.uuid, { role_id: form.role_id });
      toast.success(t("users.updated"));
      navigate(`/users/${user.uuid}`);
    } catch (err) {
      toast.error(errMsg(err, t("users.updateError")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to={`/users/${user.uuid}`}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t("users.edit")}</h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <UserForm value={form} onChange={setForm} roles={roles} variant="edit" />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop cursor-pointer disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </form>
    </>
  );
}
