import { useState, useEffect } from "react";
import { Building2, CreditCard, Palette, Globe, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Skeleton } from "@katenda_clients/ui";
import { useAccount, useUpdateAccount, useSubscription, usePlans, useChangePlan } from "@/hooks/useAccount";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

export default function Config() {
  const { data: account, isLoading: loadingAccount } = useAccount();
  const { data: subscription, isLoading: loadingSub } = useSubscription();
  const { data: plans } = usePlans();
  const updateAccount = useUpdateAccount();
  const changePlan = useChangePlan();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [form, setForm] = useState({ name: "", legal_name: "", rif: "", phone: "", address: "", city: "", state: "" });

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name || "",
        legal_name: account.legal_name || "",
        rif: account.rif || "",
        phone: account.phone || "",
        address: account.address || "",
        city: account.city || "",
        state: account.state || "",
      });
    }
  }, [account]);

  const handleSave = async () => {
    await updateAccount.mutateAsync(form);
  };

  if (loadingAccount) return <div className="space-y-4">{/* ... */}</div>;

  const planName = subscription?.plan?.name || "Sin plan";
  const isTrial = subscription?.status === 2;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t("profile.title")} />

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            {t("profile.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Razón social</Label>
              <Input value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>RIF</Label>
              <Input value={form.rif} onChange={(e) => setForm({ ...form, rif: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Dirección</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateAccount.isPending}
            className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer"
          >
            {updateAccount.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            {t("profile.plan")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSub ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold capitalize">{planName}</p>
                  <p className="text-xs text-muted-foreground">
                    {isTrial ? "Periodo de prueba" : `$${subscription?.plan?.price || 0}/mes`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isTrial ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}>
                  {isTrial ? "Trial" : "Activo"}
                </span>
              </div>
              {plans && plans.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cambiar plan</p>
                  <div className="grid gap-2">
                    {plans.map((plan) => {
                      const isCurrent = subscription?.plan_id === plan.id;
                      return (
                        <button
                          key={plan.id}
                          disabled={isCurrent || changePlan.isPending}
                          onClick={() => changePlan.mutate(plan.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                            isCurrent
                              ? "border-brand bg-brand/5"
                              : "border-border hover:border-brand/30 hover:bg-muted/50"
                          }`}
                        >
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${plan.price}/mes — {plan.limits.map((l) => `${l.feature}: ${l.limit_value === -1 ? "∞" : l.limit_value}`).join(", ")}
                            </p>
                          </div>
                          {isCurrent && <span className="text-xs text-brand font-medium">Actual</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Theme & Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <div>
                <p className="text-sm font-medium">{t("profile.theme")}</p>
                <p className="text-xs text-muted-foreground">{theme === "dark" ? t("profile.dark") : t("profile.light")}</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-muted"
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-background shadow-sm border border-border transition-transform ${theme === "dark" ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">{t("profile.lang")}</p>
                <p className="text-xs text-muted-foreground">{lang === "es" ? "Español" : "English"}</p>
              </div>
            </div>
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-muted"
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-background shadow-sm border border-border transition-transform ${lang === "en" ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
