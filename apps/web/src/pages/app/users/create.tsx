import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import type { Role } from "@/types/models";

const emptyForm: UserFormValue = {
  name: "",
  email: "",
  password: "",
  role_id: null,
};

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState<UserFormValue>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    roleService
      .index({ page: 1, per_page: 100 })
      .then((res) => {
        if (alive) setRoles(res.data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <UserFormSkeleton />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      toast.error(t("users.nameRequired"));
      return;
    }
    if (!form.email.trim()) {
      toast.error(t("users.emailRequired"));
      return;
    }
    if (!form.password.trim()) {
      toast.error(t("users.passwordRequired"));
      return;
    }
    if (!form.role_id) {
      toast.error(t("users.roleRequired"));
      return;
    }
    setSaving(true);
    try {
      const res = await userService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role_id: form.role_id,
      });
      toast.success(t("users.created"));
      navigate(`/users/${res.data.uuid}`);
    } catch (err) {
      toast.error(errMsg(err, t("users.createError")));
    } finally {
      setSaving(false);
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
        <h1 className="font-display font-bold text-2xl">{t("users.new")}</h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <UserForm value={form} onChange={setForm} roles={roles} />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop cursor-pointer disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? t("users.creating") : t("users.create")}
        </button>
      </form>
    </>
  );
}
