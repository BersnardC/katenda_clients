import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Store, User, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" as const, exact: true },
  { to: "/stores", icon: Store, key: "nav.stores" as const },
  { to: "/profile", icon: User, key: "nav.profile" as const },
];

export default function AppLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground sticky top-0 h-screen p-4 gap-2">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-brand grid place-items-center font-black text-brand-foreground">
            K
          </div>
          <span className="text-lg font-bold tracking-tight">Katenda</span>
        </Link>
        {navItems.map((it) => {
          const active = isActive(it.to, it.exact);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-brand/15 text-brand"
                  : "hover:bg-sidebar-accent text-sidebar-foreground/80",
              )}
            >
              <it.icon className="h-4 w-4" />
              {t(it.key)}
            </Link>
          );
        })}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-sidebar-accent text-sidebar-foreground/80"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 pb-24 md:pb-0 p-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
        <div className="glass-blur border border-border/60 rounded-2xl shadow-2xl flex items-center justify-around px-2 py-2">
          {navItems.map((it) => {
            const active = isActive(it.to, it.exact);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                  active ? "text-brand" : "text-muted-foreground",
                )}
              >
                <it.icon className={cn("h-5 w-5", active && "scale-110")} />
                <span className="text-[10px] font-medium">{t(it.key)}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t("nav.logout")}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
