import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useStores } from "@/hooks/useStores";
import { StoreForm, type StoreFormValue } from "@/components/stores/StoreForm";
import { SkeletonForm } from "@/components/skeletons";
import { storeService } from "@/services/storeService";
import { slugify, dataUrlToFile } from "@/lib/utils";
import type { Store } from "@/types/models";

const storeToForm = (s: Store): StoreFormValue => ({
  name: s.name,
  slug: s.slug,
  description: s.description ?? "",
  logo: s.logo_url,
  banner: s.banner_url,
  active: s.status === 1,
});

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const { data, loading, refetch } = useStores();
  const store = data?.data?.[0] ?? null;
  const [form, setForm] = useState<StoreFormValue | null>(null);
  const [saving, setSaving] = useState(false);

  const formValue = form ?? (store ? storeToForm(store) : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !formValue) return;
    if (!formValue.name.trim()) {
      toast.error(t("stores.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      await storeService.update(store.uuid, {
        name: formValue.name.trim(),
        slug: formValue.slug || slugify(formValue.name),
        description: formValue.description || undefined,
        status: formValue.active ? 1 : 0,
      });
      if (formValue.logo && formValue.logo.startsWith("data:")) {
        const file = await dataUrlToFile(formValue.logo, "logo.jpg");
        await storeService.uploadLogo(store.uuid, file);
      } else if (formValue.logo === null && store.logo_url) {
        await storeService.removeLogo(store.uuid);
      }
      if (formValue.banner && formValue.banner.startsWith("data:")) {
        const file = await dataUrlToFile(formValue.banner, "banner.jpg");
        await storeService.uploadBanner(store.uuid, file);
      } else if (formValue.banner === null && store.banner_url) {
        await storeService.removeBanner(store.uuid);
      }
      toast.success(t("stores.updated"));
      refetch();
    } catch (err) {
      toast.error(errMsg(err, t("stores.updateError")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="size-10 shrink-0 grid place-items-center rounded-full bg-surface border border-border"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-2xl truncate">
              {t("stores.title")}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {t("stores.subtitle")}
            </p>
          </div>
        </div>
        {store && (
          <Link
            to="/stores/preview"
            className="flex shrink-0 items-center gap-2 px-3 h-10 rounded-xl border border-border bg-card text-sm font-semibold"
          >
            <ExternalLink className="size-4" /> {t("stores.preview")}
          </Link>
        )}
      </header>

      <div className="px-5 mt-2 space-y-4 pb-4">
        {loading ? (
          <SkeletonForm />
        ) : store ? (
          <form onSubmit={submit} className="space-y-4">
            <StoreForm
              key={store.uuid}
              value={formValue as StoreFormValue}
              onChange={setForm}
            />
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop cursor-pointer disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? t("common.saving") : t("stores.save")}
            </button>
          </form>
        ) : (
          <CreateStoreFallback onCreated={refetch} />
        )}
      </div>
    </>
  );
}

function CreateStoreFallback({ onCreated }: { onCreated: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    if (!name.trim()) {
      toast.error(t("stores.nameRequired"));
      return;
    }
    setCreating(true);
    try {
      await storeService.create({ name: name.trim(), slug: slugify(name) });
      toast.success(t("stores.created"));
      onCreated();
    } catch (err) {
      toast.error(errMsg(err, t("stores.createError")));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-card border border-border shadow-soft space-y-4">
      <div className="size-14 rounded-2xl gradient-brand grid place-items-center text-primary-foreground mx-auto">
        <StoreIcon className="size-7" />
      </div>
      <div className="text-center">
        <p className="font-semibold">{t("stores.createTitle")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("stores.empty")}</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("stores.name")}
          maxLength={60}
          className="w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
        />
        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop cursor-pointer disabled:opacity-60"
        >
          {creating && <Loader2 className="size-4 animate-spin" />}
          {creating ? t("common.saving") : t("stores.create")}
        </button>
      </form>
    </div>
  );
}
