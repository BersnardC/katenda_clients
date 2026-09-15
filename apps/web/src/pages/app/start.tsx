import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  PackagePlus,
  Plus,
  Rocket,
  Sparkles,
  Store as StoreIcon,
  Tags,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@katenda_clients/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/contexts/AppContext";
import { slugify, dataUrlToFile } from "@/lib/utils";
import { StoreForm, type StoreFormValue } from "@/components/stores/StoreForm";
import { SkeletonStoreForm } from "@/components/skeletons";
import { storeService } from "@/services/storeService";
import { countryService } from "@/services/countryService";
import { currencyService } from "@/services/currencyService";
import { accountService } from "@/services/accountService";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import type { Account, Country, Currency, Store } from "@/types/models";

type Step = 1 | 2 | 3;

type QuickCategory = { name: string };

type QuickProduct = {
  name: string;
  category: string;
  price: string;
  stock: string;
};

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
    rating: 0,
    reviewsCount: 0,
  };
};

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

const inputClass =
  "w-full h-11 px-3 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { account, refetchAccount, stores, storesLoading } = useApp();
  const store = stores[0] ?? null;
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<StoreFormValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<QuickCategory[]>([
    { name: "" },
    { name: "" },
    { name: "" },
  ]);
  const [products, setProducts] = useState<QuickProduct[]>([
    { name: "", category: "", price: "", stock: "" },
  ]);

  const formValue = form ?? (store ? storeToForm(store, account) : null);

  useEffect(() => {
    let alive = true;
    Promise.all([countryService.list(), currencyService.list()]).then(
      ([countryRes, currencyRes]) => {
        if (alive) {
          setCountries(countryRes.countries ?? []);
          setCurrencies(currencyRes.currencies ?? []);
        }
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const saveStore = async () => {
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
        [formValue.phoneCode, formValue.phoneNumber]
          .filter(Boolean)
          .join(" ") || undefined;
      await accountService.update({
        address: formValue.address.trim() || undefined,
        rif: formValue.rif.trim() || undefined,
        country: formValue.countryIso2 || undefined,
        phone,
      });
      refetchAccount();
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
      setStep(2);
    } catch (err) {
      toast.error(errMsg(err, t("stores.updateError")));
    } finally {
      setSaving(false);
    }
  };

  const saveInventory = async () => {
    const cleanCategories = categories.filter((c) => c.name.trim());
    const cleanProducts = products.filter((p) => p.name.trim());
    if (cleanCategories.length === 0 || cleanProducts.length === 0) {
      toast.error(t("onboarding.step2Title"));
      return;
    }
    setSaving(true);
    try {
      const categoryMap: Record<string, number> = {};
      for (const cat of cleanCategories) {
        const res = await categoryService.create({
          name: cat.name.trim(),
          slug: slugify(cat.name),
        });
        categoryMap[cat.name] = res.data.id;
      }
      for (const prod of cleanProducts) {
        const catId = categoryMap[prod.category];
        await productService.create({
          name: prod.name.trim(),
          slug: slugify(prod.name),
          price: Math.max(0, Number(prod.price) || 0),
          stock: Math.max(0, Math.floor(Number(prod.stock) || 0)),
          category_id: catId,
        });
      }
      await accountService.update({ onboarded: true });
      refetchAccount();
      toast.success(t("onboarding.completeTitle"));
      setStep(3);
    } catch (err) {
      toast.error(errMsg(err, t("stores.createError")));
    } finally {
      setSaving(false);
    }
  };

  const leave = () => navigate("/dashboard");

  const updateCategory = (index: number, name: string) => {
    const previous = categories[index]?.name;
    setCategories(
      categories.map((item, i) => (i === index ? { ...item, name } : item)),
    );
    setProducts(
      products.map((item) =>
        item.category === previous ? { ...item, category: name } : item,
      ),
    );
  };

  const updateProduct = (index: number, patch: Partial<QuickProduct>) =>
    setProducts(
      products.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const addCategory = () =>
    setCategories([...categories, { name: "" }]);

  const removeCategory = (index: number) => {
    const removed = categories[index];
    setCategories(categories.filter((_, i) => i !== index));
    if (removed?.name) {
      setProducts(
        products.map((p) =>
          p.category === removed.name ? { ...p, category: "" } : p,
        ),
      );
    }
  };

  const addProduct = () =>
    setProducts([
      ...products,
      { name: "", category: "", price: "", stock: "" },
    ]);

  const removeProduct = (index: number) =>
    setProducts(products.filter((_, i) => i !== index));

  if (storesLoading) {
    return (
      <>
        <header className="px-5 pt-6 pb-3 flex items-center gap-3">
          <div className="size-10 shrink-0 grid place-items-center rounded-full bg-surface border border-border">
            <ArrowLeft className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">
              {t("onboarding.badge")}
            </p>
            <h1 className="font-display font-bold text-2xl truncate">
              {t("onboarding.title")}
            </h1>
          </div>
        </header>
        <div className="px-5 mt-2">
          <SkeletonStoreForm />
        </div>
      </>
    );
  }

  if (!store || !account || !formValue) {
    return null;
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="size-10 shrink-0 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("onboarding.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-primary">
            {t("onboarding.badge")}
          </p>
          <h1 className="font-display font-bold text-2xl truncate">
            {t("onboarding.title")}
          </h1>
        </div>
        {step < 3 && (
          <span className="text-xs font-semibold text-muted-foreground">
            {step}/2
          </span>
        )}
      </header>

      <div className="px-5 pb-8">
        {step < 3 && (
          <div className="mb-5">
            <Progress
              value={step * 50}
              aria-label={`Paso ${step} de 2`}
            />
            <div className="mt-2 grid grid-cols-2 text-xs font-semibold">
              <span
                className={step >= 1 ? "text-primary" : "text-muted-foreground"}
              >
                {t("onboarding.step1Title")}
              </span>
              <span
                className={`text-right ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}
              >
                {t("onboarding.step2Title")}
              </span>
            </div>
          </div>
        )}

        {step === 1 && (
          <StoreStep
            value={formValue}
            onChange={setForm}
            countries={countries}
            currencies={currencies}
            accountVerified={account.verified}
            storeUuid={store.uuid}
            onContinue={saveStore}
            onSkip={() => setStep(2)}
            onLeave={leave}
            saving={saving}
          />
        )}

        {step === 2 && (
          <InventoryStep
            categories={categories}
            products={products}
            updateCategory={updateCategory}
            updateProduct={updateProduct}
            addCategory={addCategory}
            removeCategory={removeCategory}
            addProduct={addProduct}
            removeProduct={removeProduct}
            onBack={() => setStep(1)}
            onSave={saveInventory}
            onSkip={async () => {
              await accountService.update({ onboarded: true });
              refetchAccount();
              setStep(3);
            }}
            onLeave={leave}
            saving={saving}
          />
        )}

        {step === 3 && <CompleteStep />}
      </div>
    </>
  );
}

function StoreStep({
  value,
  onChange,
  countries,
  currencies,
  accountVerified,
  storeUuid,
  onContinue,
  onSkip,
  onLeave,
  saving,
}: {
  value: StoreFormValue;
  onChange: (v: StoreFormValue) => void;
  countries: Country[];
  currencies: Currency[];
  accountVerified: boolean;
  storeUuid: string;
  onContinue: () => void;
  onSkip: () => void;
  onLeave: () => void;
  saving: boolean;
}) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <StepIntro
        icon={Building2}
        title={t("onboarding.step1Title")}
        text={t("onboarding.step1Intro")}
      />
      <StoreForm
        value={value}
        onChange={onChange}
        countries={countries}
        currencies={currencies}
        accountVerified={accountVerified}
        storeUuid={storeUuid}
        onboarding
      />
      <StepActions
        onLeave={onLeave}
        onSkip={onSkip}
        primaryLabel={t("onboarding.saveStore")}
        onPrimary={onContinue}
        saving={saving}
      />
    </section>
  );
}

function InventoryStep({
  categories,
  products,
  updateCategory,
  updateProduct,
  addCategory,
  removeCategory,
  addProduct,
  removeProduct,
  onBack,
  onSave,
  onSkip,
  onLeave,
  saving,
}: {
  categories: QuickCategory[];
  products: QuickProduct[];
  updateCategory: (index: number, name: string) => void;
  updateProduct: (index: number, patch: Partial<QuickProduct>) => void;
  addCategory: () => void;
  removeCategory: (index: number) => void;
  addProduct: () => void;
  removeProduct: (index: number) => void;
  onBack: () => void;
  onSave: () => void;
  onSkip: () => void;
  onLeave: () => void;
  saving: boolean;
}) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <StepIntro
        icon={PackagePlus}
        title={t("onboarding.step2Title")}
        text={t("onboarding.step2Intro")}
      />

      <Panel title={`${t("onboarding.categories")} (${categories.length})`}>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <label key={index} className="flex items-center gap-3">
              <span className="size-9 shrink-0 grid place-items-center rounded-xl bg-primary/15 text-primary">
                <Tags className="size-4" />
              </span>
              <input
                className={inputClass}
                value={category.name}
                onChange={(e) => updateCategory(index, e.target.value)}
                placeholder={`${t("onboarding.category")} ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeCategory(index)}
                className="size-9 shrink-0 grid place-items-center rounded-xl text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="size-4" />
              </button>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={addCategory}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Plus className="size-4" /> {t("onboarding.addCategory")}
        </button>
      </Panel>

      <Panel title={`${t("onboarding.products")} (${products.length})`}>
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={index}
              className="rounded-2xl bg-surface border border-border p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="size-8 grid place-items-center rounded-lg bg-primary/15 text-primary">
                  <PackagePlus className="size-4" />
                </span>
                <p className="text-sm font-bold flex-1">
                  {t("onboarding.product")} {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  className={inputClass}
                  value={product.name}
                  onChange={(e) =>
                    updateProduct(index, { name: e.target.value })
                  }
                  placeholder={t("onboarding.productName")}
                />
                <select
                  className={inputClass}
                  value={product.category}
                  onChange={(e) =>
                    updateProduct(index, { category: e.target.value })
                  }
                >
                  <option value="">{t("onboarding.category")}</option>
                  {categories
                    .filter((c) => c.name.trim())
                    .map((item, ci) => (
                      <option key={`${item.name}-${ci}`} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className="text-xs text-muted-foreground">
                      {t("onboarding.price")}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={product.price}
                      onChange={(e) =>
                        updateProduct(index, { price: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span className="text-xs text-muted-foreground">
                      {t("onboarding.stock")}
                    </span>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={product.stock}
                      onChange={(e) =>
                        updateProduct(index, { stock: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addProduct}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Plus className="size-4" /> {t("onboarding.addProduct")}
        </button>
      </Panel>

      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-border bg-card text-sm font-semibold"
        onClick={onBack}
      >
        <ArrowLeft className="size-4" /> {t("onboarding.backToStore")}
      </button>

      <StepActions
        onLeave={onLeave}
        onSkip={onSkip}
        primaryLabel={t("onboarding.saveInventory")}
        onPrimary={onSave}
        saving={saving}
      />
    </section>
  );
}

function CompleteStep() {
  const { t } = useI18n();

  return (
    <section className="min-h-[65vh] flex flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="size-24 rounded-3xl gradient-brand text-primary-foreground grid place-items-center shadow-pop">
          <Rocket className="size-11" />
        </div>
        <span className="absolute -right-2 -top-2 size-9 rounded-full bg-card border border-border grid place-items-center text-primary">
          <Sparkles className="size-4" />
        </span>
      </div>
      <p className="mt-6 text-xs font-bold text-primary">
        {t("onboarding.completeBadge")}
      </p>
      <h2 className="mt-1 font-display font-extrabold text-3xl">
        {t("onboarding.completeTitle")}
      </h2>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        {t("onboarding.completeText")}
      </p>
      <div className="mt-7 w-full space-y-3">
        <Link
          to="/mystore"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl gradient-brand shadow-pop text-primary-foreground font-semibold"
        >
          <StoreIcon className="size-4" /> {t("onboarding.goToStore")}{" "}
          <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/products"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl border border-border bg-card text-sm font-semibold"
        >
          <PackagePlus className="size-4" /> {t("onboarding.goToInventory")}
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          {t("onboarding.goToDashboard")}
        </Link>
      </div>
    </section>
  );
}

function StepIntro({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Building2;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="size-12 shrink-0 grid place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-pop">
        <Icon className="size-6" />
      </span>
      <div>
        <h2 className="font-display font-extrabold text-xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-soft space-y-3">
      <p className="text-xs font-bold text-muted-foreground uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function StepActions({
  onLeave,
  onSkip,
  primaryLabel,
  onPrimary,
  saving,
}: {
  onLeave: () => void;
  onSkip: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  saving: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="pt-1 space-y-2">
      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl gradient-brand shadow-pop text-primary-foreground font-semibold cursor-pointer disabled:opacity-60"
        onClick={onPrimary}
        disabled={saving}
      >
        {saving && <Loader2 className="size-4 animate-spin" />}
        {primaryLabel}
        {!saving && <ArrowRight className="size-4" />}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground py-2"
          onClick={onLeave}
        >
          {t("onboarding.skip")}
        </button>
        <button
          type="button"
          className="rounded-xl border border-border bg-card text-sm font-semibold py-2"
          onClick={onSkip}
        >
          {t("onboarding.skipStep")}
        </button>
      </div>
    </div>
  );
}
