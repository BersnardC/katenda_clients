"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCustomerAuth } from "@/lib/customerAuth";
import { useAccountShell } from "@/components/account/AccountShell";
import { Field } from "@/components/account/accountUi";

export function ProfilePage() {
  const { t } = useI18n();
  const { accent } = useAccountShell();
  const { customer, updateProfile } = useCustomerAuth();

  const [form, setForm] = useState({
    name: customer?.name ?? "",
    whatsapp: customer?.whatsapp ?? "",
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
        {t("profile.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>

      <div className="mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft space-y-3">
        <Field
          label={t("profile.name")}
          value={form.name}
          onChange={set("name")}
          maxLength={60}
        />
        <Field
          label={t("profile.email")}
          value={customer?.email ?? ""}
          onChange={() => {}}
          type="email"
          readOnly
        />
        <p className="text-xs text-muted-foreground -mt-1">
          {t("profile.emailReadOnly")}
        </p>
        <Field
          label={t("profile.whatsapp")}
          value={form.whatsapp}
          onChange={set("whatsapp")}
          placeholder={t("account.whatsappPh")}
          maxLength={50}
        />
        <button
          onClick={submit}
          disabled={saving}
          className="w-full h-12 rounded-2xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: accent }}
        >
          {t("profile.save")}
        </button>
        {saved && (
          <p className="text-sm text-center text-muted-foreground">
            {t("profile.saved")}
          </p>
        )}
      </div>
    </>
  );
}
