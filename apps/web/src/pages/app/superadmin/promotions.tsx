import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { adminService, type PromotionInput } from "@/services/adminService";
import type { Plan, Promotion } from "@/types/models";

const emptyForm = {
  plan_id: "",
  name: "",
  slug: "",
  description: "",
  months: "1",
  price: "",
  is_featured: false,
  status: true,
};

const num = (v: number | string) => Number(v);
const money = (v: number | string) => `$${num(v).toFixed(2)}`;
const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([adminService.plans(), adminService.promotions()])
      .then(([planRes, promoRes]) => {
        setPlans(planRes.plans);
        setPromotions(promoRes.promotions);
      })
      .catch((e) => toast.error(errMsg(e, t("sa.loadError"))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setEditingUuid(null);
    setForm({
      ...emptyForm,
      plan_id: plans[0] ? String(plans[0].id) : "",
    });
    setShowForm(true);
  };

  const startEdit = (p: Promotion) => {
    setEditingUuid(p.uuid);
    setForm({
      plan_id: String(p.plan_id),
      name: p.name,
      slug: p.slug ?? "",
      description: p.description ?? "",
      months: String(p.months),
      price: String(p.price),
      is_featured: p.is_featured,
      status: p.status,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const payload: PromotionInput = {
      plan_id: Number(form.plan_id),
      name: form.name,
      slug: form.slug || null,
      description: form.description || null,
      months: Number(form.months),
      price: Number(form.price),
      is_featured: form.is_featured,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingUuid) {
        await adminService.updatePromotion(editingUuid, payload);
        toast.success(t("sa.saved"));
      } else {
        await adminService.createPromotion(payload);
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

  const remove = async (p: Promotion) => {
    if (!window.confirm(t("sa.confirmDelete"))) return;
    try {
      await adminService.deletePromotion(p.uuid);
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
          <h1 className="font-display font-bold text-2xl">
            {t("sa.promotions")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("sa.promotionsSub")}</p>
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
            {editingUuid ? t("sa.editPromotion") : t("sa.newPromotion")}
          </h2>
          <select
            className={inputCls}
            required
            value={form.plan_id}
            onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
          >
            <option value="">{t("sa.plan")}</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} (${plan.price})
              </option>
            ))}
          </select>
          <input
            placeholder={t("sa.name")}
            className={inputCls}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="slug (opcional, ej. katenda-decembrina)"
            className={inputCls}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <textarea
            placeholder={t("sa.description")}
            className="w-full h-20 px-3 py-2 rounded-xl bg-surface border border-border outline-none focus:border-primary text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={1}
              placeholder={t("sa.months")}
              className={inputCls}
              required
              value={form.months}
              onChange={(e) => setForm({ ...form, months: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              min={0}
              placeholder={t("sa.price")}
              className={inputCls}
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="flex gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              />
              {t("sa.featured")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.checked })}
              />
              {t("sa.active")}
            </label>
          </div>
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {promotions.map((p) => (
              <li
                key={p.uuid}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm flex items-center gap-1.5 truncate">
                    {p.name}
                    {p.is_featured && (
                      <Tag className="size-3.5 text-primary shrink-0" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.plan?.name ?? "—"} · {p.months} {t("sa.months")} ·{" "}
                    {money(p.price)}
                    {!p.status ? ` · ${t("sa.inactive")}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="size-9 grid place-items-center rounded-xl bg-surface border border-border"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(p)}
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
