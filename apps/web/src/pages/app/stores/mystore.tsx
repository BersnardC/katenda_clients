import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { StoreForm, type StoreFormValue } from "@/components/stores/StoreForm";
import { SkeletonForm } from "@/components/skeletons";
import { storeService } from "@/services/storeService";
import { countryService } from "@/services/countryService";
import { currencyService } from "@/services/currencyService";
import { accountService } from "@/services/accountService";
import { slugify, dataUrlToFile } from "@/lib/utils";
import type { Account, Country, Currency, Store } from "@/types/models";

const parsePhone = (phone: string | null) => {
  if (!phone) return { code: "", number: "" };
  const m = phone.trim().match(/^(\+\d+)\s*(.*)$/);
  if (m) return { code: m[1], number: m[2] };
  return { code: "", number: phone.trim() };
};

const storeToForm = (s: Store, account: Account | null): StoreFormValue => {
  const phone = parsePhone(account?.phone ?? null);
  return {
    name: s.name,
    slug: s.slug,
    description: s.description ?? "",
    logo: s.logo_url,
    banner: s.banner_url,
    accentColor: s.accent_color,
    active: s.status === 1,
    address: account?.address ?? "",
    rif: account?.rif ?? "",
    phoneCode: phone.code,
    phoneNumber: phone.number,
    countryIso2: account?.country ?? null,
    currencyId: s.currency_id,
    currencySecondaryId: s.currency_secondary_id,
  };
};

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const [store, setStore] = useState<Store | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [form, setForm] = useState<StoreFormValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      storeService.list(),
      countryService.list(),
      currencyService.list(),
      accountService.show(),
    ])
      .then(([s, c, cu, ac]) => {
        const st = s.data?.[0] ?? null;
        const acc = ac.account ?? null;
        setStore(st);
        setAccount(acc);
        setCountries(c.countries ?? []);
        setCurrencies(cu.currencies ?? []);
        if (st) setForm(storeToForm(st, acc));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const formValue = form ?? (store ? storeToForm(store, account) : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !formValue || !account) return;
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
        currency_id: formValue.currencyId,
        currency_secondary_id: formValue.currencySecondaryId,
        accent_color: formValue.accentColor,
        status: formValue.active ? 1 : 0,
      });
      const phone =
        [formValue.phoneCode, formValue.phoneNumber].filter(Boolean).join(" ") ||
        undefined;
      await accountService.update({
        address: formValue.address.trim() || undefined,
        rif: formValue.rif.trim() || undefined,
        country: formValue.countryIso2 || undefined,
        phone,
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
      load();
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
        ) : store && account && formValue ? (
          <form onSubmit={submit} className="space-y-4">
            <StoreForm
              key={store.uuid}
              value={formValue}
              onChange={setForm}
              countries={countries}
              currencies={currencies}
              accountVerified={account.verified}
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
          <CreateStoreFallback onCreated={load} />
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
