import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@katenda_clients/ui";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();

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
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{user?.role?.name || "--"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
