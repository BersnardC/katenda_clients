import { useRef, useState } from "react";
import { BadgeCheck, Check, CheckCircle2, ImagePlus, Loader2, Star, Trash2, XCircle } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import { compressImage } from "@/lib/image";
import { slugify } from "@/lib/utils";
import { normalizeHex } from "@/lib/color";
import { ACCENT_FALLBACK, ACCENT_PRESETS, STORE_PUBLIC_URL } from "@/lib/store";
import { SearchSelect } from "@/components/SearchSelect";
import { PhoneField } from "@/components/PhoneField";
import { storeService } from "@/services/storeService";
import type { Country, Currency } from "@/types/models";

export type StoreFormValue = {
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  accentColor: string | null;
  active: boolean;
  address: string;
  rif: string;
  phoneCode: string;
  phoneNumber: string;
  countryIso2: string | null;
  currencyId: number | null;
  currencySecondaryId: number | null;
  rating: number;
  reviewsCount: number;
};

type SlugStatus = "idle" | "checking" | "available" | "taken";

export function StoreForm({
  value,
  onChange,
  countries,
  currencies,
  accountVerified,
  storeUuid,
}: {
  value: StoreFormValue;
  onChange: (v: StoreFormValue) => void;
  countries: Country[];
  currencies: Currency[];
  accountVerified: boolean;
  storeUuid?: string;
}) {
  const { t } = useI18n();
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (patch: Partial<StoreFormValue>) =>
    onChange({ ...value, ...patch });

  const setName = (name: string) => {
    const newSlug = slugify(name);
    set({ name, slug: newSlug });
    setSlugStatus("idle");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!newSlug) return;
    debounceRef.current = setTimeout(() => {
      setSlugStatus("checking");
      storeService
        .checkSlug(newSlug, storeUuid)
        .then((res) => setSlugStatus(res.available ? "available" : "taken"))
        .catch(() => setSlugStatus("idle"));
    }, 300);
  };

  const accent = value.accentColor ?? ACCENT_FALLBACK;

  const callingCodes = Array.from(
    new Set(
      countries
        .map((c) => c.calling_code)
        .filter((c): c is string => !!c),
    ),
  ).sort();

  const countryOptions = countries.map((c) => ({
    value: c.iso2,
    label: c.name,
    icon: <span className="text-base leading-none">{c.flag}</span>,
  }));

  const currencyOptions = currencies.map((c) => ({
    value: String(c.id),
    label: `${c.code} — ${c.name}`,
    icon: <span className="text-sm font-semibold tabular-nums">{c.symbol}</span>,
  }));

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  const slugIcon =
    slugStatus === "checking" ? (
      <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
    ) : slugStatus === "available" ? (
      <CheckCircle2 className="size-4 text-success shrink-0" />
    ) : slugStatus === "taken" ? (
      <XCircle className="size-4 text-destructive shrink-0" />
    ) : null;

  return (
    <div className="space-y-4">
      <Card title={t("stores.identity")}>
        <Field label={t("stores.name")}>
          <input
            value={value.name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className={inputCls}
          />
        </Field>
        <Field label={t("stores.url")}>
          <div className="flex items-center gap-2 h-12 px-4 rounded-2xl bg-surface border border-border">
            <span className="text-sm text-muted-foreground truncate">
              {STORE_PUBLIC_URL(value.slug)}
            </span>
            {slugIcon}
          </div>
        </Field>
        <Field label={t("stores.description")}>
          <textarea
            rows={3}
            value={value.description}
            onChange={(e) => set({ description: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
          />
        </Field>
      </Card>

      <Card title={t("stores.accent")}>
        <p className="text-xs text-muted-foreground -mt-1">
          {t("stores.accentSub")}
        </p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ accentColor: c })}
              aria-label={`Color ${c}`}
              className="size-10 rounded-full grid place-items-center border-2 transition"
              style={{
                backgroundColor: c,
                borderColor:
                  value.accentColor === c ? "var(--foreground)" : "transparent",
              }}
            >
              {value.accentColor === c && <Check className="size-5 text-white" />}
            </button>
          ))}
          <label className="size-10 rounded-full border border-dashed border-border grid place-items-center cursor-pointer overflow-hidden">
            <input
              type="color"
              value={accent}
              onChange={(e) =>
                set({ accentColor: normalizeHex(e.target.value) ?? ACCENT_FALLBACK })
              }
              className="size-12 cursor-pointer opacity-0 absolute"
              aria-label={t("stores.accentCustom")}
            />
            <span className="text-xs font-semibold text-muted-foreground">+</span>
          </label>
        </div>
      </Card>

      <Card title={t("stores.media")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageDrop
            label={t("stores.logo")}
            value={value.logo}
            onChange={(logo) => set({ logo })}
            className="h-32"
            round
          />
          <ImageDrop
            label={t("stores.banner")}
            value={value.banner}
            onChange={(banner) => set({ banner })}
            className="h-32"
          />
        </div>
        <div className="mt-2 rounded-2xl overflow-hidden border border-border">
          <div
            className="h-24 bg-muted relative"
            style={{ backgroundColor: accent + "22" }}
          >
            {value.banner && (
              <img
                src={value.banner}
                alt="Vista previa del banner"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4 flex items-center gap-3 bg-card">
            <div
              className="size-12 rounded-2xl grid place-items-center overflow-hidden font-display font-extrabold text-white -mt-8 border-4 border-card"
              style={{ backgroundColor: accent }}
            >
              {value.logo ? (
                <img
                  src={value.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                value.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {value.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title={t("stores.companyData")}>
        <Field label={t("stores.address")}>
          <textarea
            rows={2}
            value={value.address}
            onChange={(e) => set({ address: e.target.value })}
            maxLength={140}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
          />
        </Field>
        <Field label={t("stores.rif")}>
          <input
            value={value.rif}
            onChange={(e) => set({ rif: e.target.value })}
            maxLength={30}
            className={inputCls}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("stores.country")}>
            <SearchSelect
              value={value.countryIso2}
              onChange={(iso2) => {
                set({ countryIso2: iso2 });
                const country = countries.find((c) => c.iso2 === iso2);
                if (country?.calling_code) {
                  set({ phoneCode: country.calling_code });
                }
              }}
              options={countryOptions}
              placeholder={t("stores.countryPlaceholder")}
              searchPlaceholder={t("stores.search")}
              emptyLabel={t("common.empty")}
            />
          </Field>
          <PhoneField
            code={value.phoneCode}
            number={value.phoneNumber}
            onChange={(phoneCode, phoneNumber) => set({ phoneCode, phoneNumber })}
            callingCodes={callingCodes}
            label={t("stores.phone")}
            numberPlaceholder="412 000 0000"
          />
        </div>
      </Card>

      <Card title={t("stores.currency")}>
        <SearchSelect
          value={value.currencyId ? String(value.currencyId) : null}
          onChange={(v) => set({ currencyId: v ? Number(v) : null })}
          options={currencyOptions}
          placeholder={t("stores.currencyPlaceholder")}
          searchPlaceholder={t("stores.search")}
          emptyLabel={t("common.empty")}
        />
        <SearchSelect
          value={value.currencySecondaryId ? String(value.currencySecondaryId) : null}
          onChange={(v) => set({ currencySecondaryId: v ? Number(v) : null })}
          options={currencyOptions}
          placeholder={t("stores.currencySecondaryPlaceholder")}
          searchPlaceholder={t("stores.search")}
          emptyLabel={t("common.empty")}
          allowClear
          clearLabel={t("stores.currencyNone")}
        />
      </Card>

      <Card title={t("stores.reputation")}>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-3 px-4 h-14 rounded-2xl bg-surface border border-border"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <BadgeCheck
              className="size-5"
              style={{ color: accountVerified ? accent : undefined }}
            />
            {t("stores.verified")}
            <span className="text-xs text-muted-foreground font-normal">
              {accountVerified ? t("stores.verifiedYes") : t("stores.verifiedNo")}
            </span>
          </span>
          <span
            className={`relative w-11 h-6 rounded-full transition ${accountVerified ? "" : "bg-muted"}`}
            style={accountVerified ? { backgroundColor: accent } : undefined}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${accountVerified ? "left-[22px]" : "left-0.5"}`}
            />
          </span>
        </button>

        <Field label={`${t("stores.rating")} — ${value.rating.toFixed(1)}`}>
          <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-surface border border-border">
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="size-4"
                  style={{ color: accent }}
                  fill={i <= Math.round(value.rating) ? accent : "transparent"}
                  strokeWidth={1.75}
                />
              ))}
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={value.rating}
              onChange={(e) => set({ rating: Number(e.target.value) })}
              className="flex-1 accent-current"
              style={{ color: accent }}
              aria-label={t("stores.rating")}
            />
          </div>
        </Field>

        <Field label={t("stores.reviewsCount")}>
          <input
            type="number"
            min={0}
            max={999999}
            value={value.reviewsCount}
            onChange={(e) => set({ reviewsCount: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
            className={`${inputCls} tabular-nums`}
          />
        </Field>
      </Card>

      <Card title={t("stores.status")}>
        <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-surface border border-border">
          <span className="flex-1 font-medium text-sm">{t("stores.active")}</span>
          <Switch
            checked={value.active}
            onCheckedChange={(active) => set({ active })}
          />
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-3xl bg-card border border-border shadow-soft space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function ImageDrop({
  label,
  value,
  onChange,
  className = "",
  round = false,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  className?: string;
  round?: boolean;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const read = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const optimized = await compressImage(file);
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.readAsDataURL(optimized);
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          read(e.dataTransfer.files[0]);
        }}
        className={`relative grid place-items-center cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition ${
          drag ? "border-primary bg-primary/5" : "border-border bg-surface"
        } ${className}`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className={`w-full h-full ${round ? "object-contain p-3" : "object-cover"}`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-2 right-2 size-7 grid place-items-center rounded-full bg-destructive text-destructive-foreground"
              aria-label={`Eliminar ${label}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <ImagePlus className="size-6 mx-auto mb-1" />
            <p className="text-xs">{t("stores.dropzone")}</p>
          </div>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => read(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
