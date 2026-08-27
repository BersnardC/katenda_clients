import { useI18n } from "@/lib/i18n";

export type UserFormValue = {
  name: string;
  current_password: string;
  password: string;
  password_confirmation: string;
};

export function UserForm({
  value,
  onChange,
}: {
  value: UserFormValue;
  onChange: (v: UserFormValue) => void;
}) {
  const { t } = useI18n();

  const setField = (key: keyof UserFormValue, v: string) =>
    onChange({ ...value, [key]: v });

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-1.5">{t("profile.name")}</p>
        <input
          value={value.name}
          onChange={(e) => setField("name", e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">
          {t("profile.currentPassword")}
        </p>
        <input
          type="password"
          value={value.current_password}
          onChange={(e) => setField("current_password", e.target.value)}
          className={inputCls}
          placeholder={t("profile.currentPasswordPlaceholder")}
          autoComplete="current-password"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">{t("profile.password")}</p>
        <input
          type="password"
          value={value.password}
          onChange={(e) => setField("password", e.target.value)}
          className={inputCls}
          placeholder={t("profile.passwordHint")}
          autoComplete="new-password"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">
          {t("profile.passwordConfirm")}
        </p>
        <input
          type="password"
          value={value.password_confirmation}
          onChange={(e) => setField("password_confirmation", e.target.value)}
          className={inputCls}
          autoComplete="new-password"
        />
      </div>
    </div>
  );
}
