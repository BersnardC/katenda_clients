"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCustomerAuth } from "@/lib/customerAuth";
import { useAccountShell } from "@/components/account/AccountShell";
import { Field } from "@/components/account/accountUi";

export function AddressesPage() {
  const { t } = useI18n();
  const { accent } = useAccountShell();
  const { customer, updateProfile } = useCustomerAuth();

  const [form, setForm] = useState({
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    delivery_notes: customer?.delivery_notes ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const set =
    (k: keyof typeof form) => (v: string) => {
      setForm((f) => ({ ...f, [k]: v }));
      setSaved(false);
    };

  const submit = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="font-display font-extrabold text-2xl tracking-tight">
        {t("address.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("address.subtitle")}</p>

      <div className="mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="size-4" style={{ color: accent }} />{" "}
          {t("address.deliveryData")}
        </div>
        <Field
          label={t("address.address")}
          value={form.address}
          onChange={set("address")}
          placeholder={t("address.addressPh")}
          maxLength={120}
        />
        <Field
          label={t("address.city")}
          value={form.city}
          onChange={set("city")}
          placeholder={t("address.cityPh")}
          maxLength={60}
        />
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("address.deliveryNotes")}
          </span>
          <textarea
            value={form.delivery_notes}
            maxLength={200}
            onChange={(e) => set("delivery_notes")(e.target.value)}
            rows={3}
            placeholder={t("address.deliveryNotesPh")}
            className="mt-1 w-full p-4 rounded-2xl bg-surface border border-border outline-none text-sm resize-none"
          />
        </label>
        <button
          onClick={submit}
          disabled={saving}
          className="w-full h-12 rounded-2xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: accent }}
        >
          {t("address.save")}
        </button>
        {saved && (
          <p className="text-sm text-center text-muted-foreground">
            {t("address.saved")}
          </p>
        )}
      </div>
    </>
  );
}
