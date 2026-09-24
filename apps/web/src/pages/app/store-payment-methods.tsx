import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/contexts/AppContext";
import {
  storePaymentMethodService,
  type PaymentMethodInput,
} from "@/services/storePaymentMethodService";
import type {
  PaymentGateway,
  PaymentMethodField,
  PlatformBank,
  Store,
  PaymentMethod,
} from "@/types/models";

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const { stores, storesLoading } = useApp();

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [globalMethods, setGlobalMethods] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [selectedGlobalMethod, setSelectedGlobalMethod] =
    useState<PaymentGateway | null>(null);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!storesLoading && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
    }
  }, [stores, storesLoading, selectedStore]);

  const load = () => {
    if (!selectedStore) return;
    setLoading(true);
    Promise.all([
      storePaymentMethodService.index(selectedStore.uuid),
      storePaymentMethodService.globalMethods(),
    ])
      .then(([res, gm]) => {
        setMethods(res.data ?? []);
        setGlobalMethods(gm.payment_gateways ?? []);
      })
      .catch((e) => toast.error(errMsg(e, t("sa.loadError"))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedStore) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore]);

  const startCreate = () => {
    setEditingUuid(null);
    setSelectedGlobalMethod(null);
    setLabel("");
    setNote("");
    setFieldValues({});
    setShowForm(true);
  };

  const startEdit = (m: PaymentMethod) => {
    setEditingUuid(m.uuid);
    setSelectedGlobalMethod(m.payment_gateway ?? null);
    setLabel(m.label ?? "");
    setNote(m.note ?? "");
    setFieldValues(m.data ?? {});
    setShowForm(true);
  };

  const selectGlobalMethod = (gm: PaymentGateway) => {
    setSelectedGlobalMethod(gm);
    setFieldValues({});
  };

  const getFields = (): PaymentMethodField[] => {
    const instr = selectedGlobalMethod?.instructions;
    if (!instr || !("fields" in instr)) return [];
    const fields =
      (instr as unknown as { fields: PaymentMethodField[] }).fields ?? [];
    return fields.filter((f) => !f.hidden);
  };

  const formatDataValue = (
    m: PaymentMethod,
    key: string,
    value: string,
  ): string => {
    const instr = m.payment_gateway?.instructions;
    const fields =
      instr && "fields" in instr
        ? (instr as unknown as { fields: PaymentMethodField[] }).fields ?? []
        : [];
    const field = fields.find((f) => f.key === key);
    if (field?.source === "platform_banks") {
      const bank = m.payment_gateway?.platform_banks?.find(
        (b) => String(b.id) === value,
      );
      return bank?.name ?? value;
    }
    return value;
  };

  const getSourceOptions = (field: PaymentMethodField): PlatformBank[] => {
    if (field.source !== "platform_banks") return [];
    const banks = selectedGlobalMethod?.platform_banks ?? [];
    const filters = field.source_filters ?? {};
    return banks.filter((b) => {
      if (filters.type && b.type !== filters.type) return false;
      if (filters.country_id && b.country_id !== filters.country_id && b.country_id !== null) return false;
      return true;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !selectedStore || !selectedGlobalMethod) return;

    const payload: PaymentMethodInput = {
      paymentable_type: "stores",
      paymentable_id: selectedStore.id,
      payment_gateway_id: selectedGlobalMethod.id,
      label: label || null,
      data: Object.keys(fieldValues).length > 0 ? fieldValues : null,
      note: note || null,
    };

    setSaving(true);
    try {
      if (editingUuid) {
        await storePaymentMethodService.update(editingUuid, payload);
        toast.success(t("sa.saved"));
      } else {
        await storePaymentMethodService.store(payload);
        toast.success(t("sa.created"));
      }

      setShowForm(false);
      setEditingUuid(null);
      load();
    } catch (e) {
      toast.error(errMsg(e, t("sa.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (m: PaymentMethod) => {
    try {
      if (m.is_active) {
        await storePaymentMethodService.deactivate(m.uuid);
      } else {
        await storePaymentMethodService.activate(m.uuid);
      }
      load();
    } catch (e) {
      toast.error(errMsg(e, t("sa.saveError")));
    }
  };

  const remove = async (m: PaymentMethod) => {
    if (!window.confirm(t("sa.confirmDelete"))) return;
    try {
      await storePaymentMethodService.destroy(m.uuid);
      toast.success(t("sa.deleted"));
      load();
    } catch (e) {
      toast.error(errMsg(e, t("sa.saveError")));
    }
  };

  if (storesLoading) {
    return (
      <div className="px-5 pt-6 pb-3">
        <div className="h-10 w-40 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="px-5 pt-6 pb-3">
        <header className="flex items-center gap-3">
          <Link
            to="/mystore"
            className="size-10 grid place-items-center rounded-full bg-surface border border-border"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="font-display font-bold text-2xl">{t("spm.title")}</h1>
        </header>
        <div className="mt-6 py-12 text-center text-muted-foreground text-sm">
          {t("spm.empty")}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/mystore"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl">
            {t("spm.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("spm.titleSub")}</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
        >
          <Plus className="size-3.5" /> {t("spm.add")}
        </button>
      </header>

      {/* Store selector (only if multiple stores) */}
      {stores.length > 1 && (
        <div className="px-5 mt-2">
          <select
            className="w-full h-11 px-3 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm"
            value={selectedStore?.uuid ?? ""}
            onChange={(e) => {
              const store = stores.find((s) => s.uuid === e.target.value);
              setSelectedStore(store ?? null);
            }}
          >
            {stores.map((s) => (
              <option key={s.uuid} value={s.uuid}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={save}
          className="mx-5 mt-4 p-5 rounded-3xl bg-card border border-border shadow-soft space-y-4"
        >
          <h2 className="font-display font-bold">
            {editingUuid ? t("spm.edit") : t("spm.new")}
          </h2>

          {/* Global gateway selector */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              {t("spm.selectMethod")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {globalMethods
                .filter((gm) => gm.is_active)
                .map((gm) => (
                  <button
                    key={gm.uuid}
                    type="button"
                    onClick={() => selectGlobalMethod(gm)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left text-sm transition ${
                      selectedGlobalMethod?.id === gm.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <CreditCard className="size-4 shrink-0" />
                    <div>
                      <p className="font-semibold">{gm.name}</p>
                      <p className="text-xs text-muted-foreground">{gm.code}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {selectedGlobalMethod && (
            <>
              {/* Label */}
              <input
                placeholder={t("spm.labelPlaceholder")}
                className={inputCls}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />

              {/* Dynamic fields from schema */}
              {getFields().map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium mb-1 block">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-0.5">*</span>
                    )}
                  </label>
                  {field.type === "select" ? (
                    <select
                      className={inputCls}
                      required={field.required}
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFieldValues({ ...fieldValues, [field.key]: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {field.source === "platform_banks"
                        ? getSourceOptions(field).map((bank) => (
                            <option key={bank.id} value={String(bank.id)}>
                              {bank.name}
                            </option>
                          ))
                        : field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="w-full h-20 px-3 py-2 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm"
                      placeholder={field.placeholder}
                      required={field.required}
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFieldValues({ ...fieldValues, [field.key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className={inputCls}
                      required={field.required}
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFieldValues({ ...fieldValues, [field.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}

              {/* Note */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("spm.noteLabel")}
                </label>
                <textarea
                  placeholder={t("spm.hintPlaceholder")}
                  className="w-full h-16 px-3 py-2 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 h-11 rounded-2xl bg-muted font-semibold text-sm"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving || !selectedGlobalMethod}
              className="flex-1 h-11 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </form>
      )}

      <section className="px-5 mt-4 mb-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {t("spm.empty")}
          </div>
        ) : (
          <ul className="space-y-2">
            {methods.map((m) => (
              <li
                key={m.uuid}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
              >
                <CreditCard className="size-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {m.label ?? m.payment_gateway?.name ?? "—"}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      · {m.payment_gateway?.code}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.data
                      ? Object.entries(m.data)
                          .filter(([, value]) => value)
                          .map(([key, value]) =>
                            formatDataValue(m, key, value),
                          )
                          .join(" · ")
                      : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    m.is_active
                      ? "bg-success/20 text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.is_active ? t("sa.active") : t("sa.inactive")}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(m)}
                  className="size-9 grid place-items-center rounded-xl bg-surface border border-border"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(m)}
                  className="size-9 grid place-items-center rounded-xl bg-surface border border-border text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

const inputCls =
  "w-full h-11 px-3 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm";
