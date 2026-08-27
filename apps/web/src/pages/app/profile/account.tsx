import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import {
  AccountForm,
  type AccountFormValue,
} from "@/components/profile/AccountForm";
import { SkeletonForm } from "@/components/skeletons";
import { accountService } from "@/services/accountService";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState<AccountFormValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    accountService
      .show()
      .then((res) => {
        if (!alive) return;
        setForm({
          name: res.account.name,
          legal_name: res.account.legal_name ?? "",
          rif: res.account.rif ?? "",
          email: res.account.email ?? "",
          phone: res.account.phone ?? "",
          logo_url: res.account.logo_url ?? "",
          address: res.account.address ?? "",
          city: res.account.city ?? "",
          state: res.account.state ?? "",
          country: res.account.country ?? "",
        });
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
  }, []);

  if (loading) {
    return <SkeletonForm fields={5} />;
  }

  if (error || !form) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("profile.loadError")}</p>
        <Link to="/profile" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      toast.error(t("profile.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      await accountService.update({
        name: form.name.trim(),
        legal_name: form.legal_name.trim() || undefined,
        rif: form.rif.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        logo_url: form.logo_url.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        country: form.country.trim() || undefined,
      });
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
        <h1 className="font-display font-bold text-2xl">
          {t("profile.account")}
        </h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <AccountForm value={form} onChange={setForm} />
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
