import { useI18n } from "@/lib/i18n";
import type { Role } from "@/types/models";
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 } from "@katenda_clients/ui/select";

export type UserFormValue = {
  name: string;
  email: string;
  password: string;
  role_id: number | null;
};

export function UserForm({
  value,
  onChange,
  roles,
  variant = "create",
}: {
  value: UserFormValue;
  onChange: (v: UserFormValue) => void;
  roles: Role[];
  variant?: "create" | "edit";
}) {
  const { t } = useI18n();

  const set = (patch: Partial<UserFormValue>) =>
    onChange({ ...value, ...patch });

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-muted-foreground"
          htmlFor="uf-name"
        >
          {t("users.name")}
        </label>
        <input
          id="uf-name"
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          maxLength={100}
          placeholder="Ana García"
          readOnly={variant === "edit"}
          className={`${inputCls} ${variant === "edit" ? "opacity-60" : ""}`}
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-muted-foreground"
          htmlFor="uf-email"
        >
          {t("users.email")}
        </label>
        <input
          id="uf-email"
          type="email"
          value={value.email}
          onChange={(e) => set({ email: e.target.value })}
          maxLength={255}
          placeholder="ana@katenda.com"
          readOnly={variant === "edit"}
          className={`${inputCls} ${variant === "edit" ? "opacity-60" : ""}`}
        />
      </div>

      {variant === "create" && (
        <div className="space-y-2">
          <label
            className="text-xs font-semibold text-muted-foreground"
            htmlFor="uf-password"
          >
            {t("users.password")}
          </label>
          <input
            id="uf-password"
            type="password"
            value={value.password}
            onChange={(e) => set({ password: e.target.value })}
            maxLength={255}
            placeholder="••••••••"
            className={inputCls}
          />
          <p className="text-[11px] text-muted-foreground">
            {t("users.passwordHint")}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label
          className="text-xs font-semibold text-muted-foreground"
          htmlFor="uf-role"
        >
          {t("users.role")}
        </label>
        <Select value={value.role_id?.toString() ?? ""} onValueChange={(v) => set({ role_id: v ? Number(v) : null })}>
          <SelectTrigger className="w-full h-12 rounded-2xl bg-surface border-border">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
