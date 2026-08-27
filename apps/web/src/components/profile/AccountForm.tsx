import { useI18n, type Key } from "@/lib/i18n";

export type AccountFormValue = {
  name: string;
  legal_name: string;
  rif: string;
  email: string;
  phone: string;
  logo_url: string;
  address: string;
  city: string;
  state: string;
  country: string;
};

const fields: Array<{ key: keyof AccountFormValue; label: Key }> = [
  { key: "name", label: "profile.name" },
  { key: "legal_name", label: "profile.legalName" },
  { key: "rif", label: "profile.rif" },
  { key: "email", label: "profile.email" },
  { key: "phone", label: "profile.phone" },
  { key: "logo_url", label: "profile.logoUrl" },
  { key: "address", label: "profile.address" },
  { key: "city", label: "profile.city" },
  { key: "state", label: "profile.state" },
  { key: "country", label: "profile.country" },
];

export function AccountForm({
  value,
  onChange,
}: {
  value: AccountFormValue;
  onChange: (v: AccountFormValue) => void;
}) {
  const { t } = useI18n();

  const setField = (key: keyof AccountFormValue, v: string) =>
    onChange({ ...value, [key]: v });

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <p className="text-sm font-medium mb-1.5">{t(f.label)}</p>
          {f.key === "address" ? (
            <textarea
              value={value[f.key]}
              onChange={(e) => setField(f.key, e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
            />
          ) : (
            <input
              value={value[f.key]}
              onChange={(e) => setField(f.key, e.target.value)}
              className={inputCls}
            />
          )}
        </div>
      ))}
    </div>
  );
}
