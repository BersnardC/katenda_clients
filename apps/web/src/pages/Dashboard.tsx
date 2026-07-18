import { Store, Package, CreditCard, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@katenda_clients/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useSubscription } from "@/hooks/useAccount";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: subscription, isLoading: loadingSub } = useSubscription();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.subtitle")}, {user?.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tiendas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-2xl font-bold">{stats?.storeCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">tiendas activas</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-2xl font-bold">{stats?.productCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">en total</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSub ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div>
                <p className="text-2xl font-bold capitalize">{subscription?.plan?.name || "Sin plan"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${subscription?.plan?.price || 0}/mes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Acceso rápido</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <a
            href="/stores"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-brand/30 hover:bg-muted/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-brand/15 grid place-items-center">
              <Store className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-medium">Gestionar tiendas</p>
              <p className="text-xs text-muted-foreground">Administra tus tiendas y catálogos</p>
            </div>
          </a>
          <a
            href="/config"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-brand/30 hover:bg-muted/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-accent/15 grid place-items-center">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Configuración</p>
              <p className="text-xs text-muted-foreground">Plan, cuenta y preferencias</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
