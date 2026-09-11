import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { adminService, type PaymentMethodInput } from "@/services/adminService";
import type { PaymentMethod } from "@/types/models";

const emptyForm = {
  code: "",
  name: "",
  label: "",
  sort_order: "0",
  is_active: true,
  instructions: "{}",
};

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminService
      .paymentMethods()
      .then((res) => setMethods(res.payment_methods))
      .catch((e) => toast.error(errMsg(e, t("sa.loadError"))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setEditingUuid(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (m: PaymentMethod) => {
    setEditingUuid(m.uuid);
    setForm({
      code: m.code,
      name: m.name,
      label: m.label ?? "",
      sort_order: String(m.sort_order),
      is_active: m.is_active,
      instructions: JSON.stringify(m.instructions ?? {}, null, 2),
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const parseInstructions = (): Record<string, string> | null => {
      try {
        return JSON.parse(form.instructions || "{}") as Record<string, string>;
      } catch {
        return null;
      }
    };

    const instructions = parseInstructions();
    if (!instructions) {
      toast.error(t("sa.invalidJson"));
      return;
    }

    const payload: PaymentMethodInput = {
      code: form.code,
      name: form.name,
      label: form.label || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      instructions,
    };

    setSaving(true);
    try {
      if (editingUuid) {
        await adminService.updatePaymentMethod(editingUuid, payload);
        toast.success(t("sa.saved"));
      } else {
        await adminService.createPaymentMethod(payload);
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
      await adminService.updatePaymentMethod(m.uuid, { is_active: !m.is_active });
      load();
    } catch (e) {
      toast.error(errMsg(e, t("sa.saveError")));
    }
  };

  const remove = async (m: PaymentMethod) => {
    if (!window.confirm(t("sa.confirmDelete"))) return;
    try {
      await adminService.deletePaymentMethod(m.uuid);
      toast.success(t("sa.deleted"));
      load();
    } catch (e) {
      toast.error(errMsg(e, t("sa.saveError")));
    }
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
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl">{t("sa.methods")}</h1>
          <p className="text-sm text-muted-foreground">{t("sa.methodsSub")}</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
        >
          <Plus className="size-3.5" /> {t("sa.new")}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={save}
          className="mx-5 mt-4 p-5 rounded-3xl bg-card border border-border shadow-soft space-y-3"
        >
          <h2 className="font-display font-bold">
            {editingUuid ? t("sa.editMethod") : t("sa.newMethod")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="code (ej. zelle)"
              className={inputCls}
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              placeholder={t("sa.name")}
              className={inputCls}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <input
            placeholder="label (opcional)"
            className={inputCls}
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3 items-center">
            <input
              type="number"
              placeholder={t("sa.sort")}
              className={inputCls}
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              {t("sa.active")}
            </label>
          </div>
          <textarea
            placeholder='{"bank":"...","account":"..."}'
            className="w-full h-32 px-3 py-2 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm font-mono"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
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
              disabled={saving}
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
        ) : (
          <ul className="space-y-2">
            {methods.map((m) => (
              <li
                key={m.uuid}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {m.name}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      · {m.code}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.label ?? "—"} · sort {m.sort_order}
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
