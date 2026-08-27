import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";
import { UserForm, type UserFormValue } from "@/components/profile/UserForm";
import { authService } from "@/services/authService";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState<UserFormValue>({
    name: user?.name ?? "",
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      toast.error(t("profile.nameRequired"));
      return;
    }
    if (form.password && !form.current_password) {
      toast.error(t("profile.currentPasswordRequired"));
      return;
    }
    if (form.password && form.password !== form.password_confirmation) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }
    setSaving(true);
    try {
      const res = await authService.updateProfile({
        name: form.name.trim(),
        ...(form.password
          ? {
              current_password: form.current_password,
              password: form.password,
              password_confirmation: form.password_confirmation,
            }
          : {}),
      });
      updateUser(res.user);
      toast.success(t("profile.saved"));
      navigate("/profile");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("profile.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/profile"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t("profile.edit")}</h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <UserForm value={form} onChange={setForm} />
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
