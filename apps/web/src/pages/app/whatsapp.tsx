import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import {
  normalizeWhatsappSettings,
  renderWhatsappMessage,
} from "@/lib/whatsapp";
import { storeBrand } from "@/lib/storeBrand";
import { storeService } from "@/services/storeService";
import { contactService } from "@/services/contactService";
import { countryService } from "@/services/countryService";
import { accountService } from "@/services/accountService";
import { SearchSelect } from "@/components/SearchSelect";
import { PhoneField } from "@/components/PhoneField";
import type { Account, Country, Store, WhatsappSettings } from "@/types/models";

const sample = {
  cliente: "Ana García",
  productos: "• 2× Camiseta Pro – $49.80\n• 1× Mochila Urbana – $45.50",
  total: "$95.30",
  fecha: new Date().toLocaleDateString("es-ES"),
};

const TEMPLATE_VARS = ["{cliente}", "{tienda}", "{productos}", "{total}", "{fecha}"];

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

// Separa "+58 412 000 0000" en code "+58" y number "412 000 0000"
const parsePhone = (phone: string | null) => {
  if (!phone) return { code: "", number: "" };
  const m = phone.trim().match(/^(\+\d+)\s*(.*)$/);
  if (m) return { code: m[1], number: m[2] };
  return { code: "", number: phone.trim() };
};

export function Component() {
  const { t } = useI18n();
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [wa, setWa] = useState<WhatsappSettings>({
    template: "",
    include_photo: true,
    include_total: true,
    include_note: false,
    note: "",
  });
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const applyAccountPhone = useCallback(() => {
    accountService
      .show()
      .then((res) => {
        const acc: Account | null = res.account ?? null;
        if (!acc?.phone) return;
        const p = parsePhone(acc.phone);
        setPhoneCode(p.code);
        setPhoneNumber(p.number);
      })
      .catch(() => undefined);
  }, []);

  const load = useCallback(() => {
    storeService
      .list()
      .then((res) => {
        const list = res.data ?? [];
        setStores(list);
        const store = list[0];
        if (!store) return;
        setStoreId(store.uuid);
        setWa(normalizeWhatsappSettings(store.settings));
        return contactService
          .list("stores", store.uuid)
          .then((c) => {
            const waContact = c.contacts?.find((x) => x.type === "whatsapp");
            if (waContact) {
              const p = parsePhone(waContact.value);
              setPhoneCode(p.code);
              setPhoneNumber(p.number);
            } else {
              applyAccountPhone();
            }
          })
          .catch(() => undefined);
      })
      .catch((e) => toast.error(errMsg(e, t("wa.loadError"))))
      .finally(() => setLoading(false));
  }, [t, applyAccountPhone]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    countryService
      .list()
      .then((res) => setCountries(res.countries ?? []))
      .catch(() => undefined);
  }, []);

  const selectStore = async (uuid: string) => {
    setStoreId(uuid);
    try {
      const res = await storeService.show(uuid);
      setWa(normalizeWhatsappSettings(res.data.settings));
      const c = await contactService.list("stores", uuid);
      const waContact = c.contacts?.find((x) => x.type === "whatsapp");
      if (waContact) {
        const p = parsePhone(waContact.value);
        setPhoneCode(p.code);
        setPhoneNumber(p.number);
      } else {
        applyAccountPhone();
      }
    } catch {
      // noop: se mantiene el estado actual
    }
  };

  const store = stores.find((s) => s.uuid === storeId) ?? stores[0];

  const callingCodes = Array.from(
    new Set(
      countries
        .map((c) => c.calling_code)
        .filter((c): c is string => !!c),
    ),
  ).sort();

  const storeOptions = stores.map((s) => ({
    value: s.uuid,
    label: s.name,
    icon: <span className="text-base leading-none">{storeBrand(s.slug).emoji}</span>,
  }));

  const rendered = useMemo(() => {
    let out = renderWhatsappMessage(wa.template || "", {
      cliente: sample.cliente,
      tienda: store?.name ?? "",
      productos: sample.productos,
      total: wa.include_total ? sample.total : "—",
      fecha: sample.fecha,
    });
    if (wa.include_note && wa.note) out += `\n\n${wa.note}`;
    return out;
  }, [wa, store]);

  const save = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const phone =
        [phoneCode, phoneNumber].filter(Boolean).join(" ") || undefined;
      await storeService.updateWhatsapp(store.uuid, {
        settings: { whatsapp: wa },
        phone,
      });
      toast.success(t("wa.saved"));
      load();
    } catch (err) {
      toast.error(errMsg(err, t("wa.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const test = () => {
    const url = `https://wa.me/${[phoneCode, phoneNumber]
      .join("")
      .replace(/\D/g, "")}?text=${encodeURIComponent(rendered)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t("wa.title")}</h1>
      </header>

      <div className="px-5 space-y-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground rounded-3xl bg-card border border-border">
            {t("stores.empty")}
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium mb-1.5">{t("wa.store")}</p>
              {stores.length === 1 && store ? (
                <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-surface border border-border">
                  <span
                    className="size-9 rounded-xl grid place-items-center text-lg"
                    style={{ backgroundColor: storeBrand(store.slug).color + "33" }}
                  >
                    {storeBrand(store.slug).emoji}
                  </span>
                  <span className="font-medium text-sm truncate">
                    {store.name}
                  </span>
                </div>
              ) : (
                <SearchSelect
                  value={storeId}
                  onChange={(uuid) => uuid && selectStore(uuid)}
                  options={storeOptions}
                  placeholder={t("wa.store")}
                  searchPlaceholder={t("stores.search")}
                  emptyLabel={t("common.empty")}
                />
              )}
            </div>

            <div>
              <PhoneField
                code={phoneCode}
                number={phoneNumber}
                onChange={(code, number) => {
                  setPhoneCode(code);
                  setPhoneNumber(number);
                }}
                callingCodes={callingCodes}
                label={t("wa.phone")}
                numberPlaceholder={t("wa.phoneNumberPlaceholder")}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t("wa.phoneSub")}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1.5">{t("wa.template")}</p>
              <textarea
                value={wa.template}
                onChange={(e) => setWa((p) => ({ ...p, template: e.target.value }))}
                rows={7}
                className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm font-mono"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TEMPLATE_VARS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      setWa((p) => ({ ...p, template: p.template + " " + v }))
                    }
                    className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Toggle
                label={t("wa.includePhoto")}
                checked={wa.include_photo}
                onChange={(v) => setWa((p) => ({ ...p, include_photo: v }))}
              />
              <Toggle
                label={t("wa.includeTotal")}
                checked={wa.include_total}
                onChange={(v) => setWa((p) => ({ ...p, include_total: v }))}
              />
              <Toggle
                label={t("wa.includeNote")}
                checked={wa.include_note}
                onChange={(v) => setWa((p) => ({ ...p, include_note: v }))}
              />
            </div>

            {wa.include_note && (
              <div>
                <p className="text-sm font-medium mb-1.5">{t("wa.note")}</p>
                <textarea
                  value={wa.note}
                  onChange={(e) => setWa((p) => ({ ...p, note: e.target.value }))}
                  rows={2}
                  placeholder={t("wa.notePlaceholder")}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
                />
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">{t("wa.preview")}</p>
              <div className="rounded-3xl p-4" style={{ background: "#0b141a" }}>
                <div className="flex justify-end">
                  <div
                    className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm whitespace-pre-wrap shadow"
                    style={{ background: "#005c4b", color: "#e9edef" }}
                  >
                    {wa.include_photo && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=240&q=70"
                          alt=""
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    {rendered}
                    <span className="block text-right text-[10px] opacity-70 mt-1">
                      12:34 ✓✓
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="py-4 rounded-2xl bg-card border border-border font-semibold disabled:opacity-60"
              >
                {saving ? t("common.saving") : t("common.save")}
              </button>
              <button
                onClick={test}
                className="py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop flex items-center justify-center gap-2"
              >
                <Send className="size-4" /> {t("wa.test")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 h-12 rounded-2xl bg-card border border-border">
      <span className="flex-1 font-medium text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
