import { LayoutDashboard, Package, Store, Settings, Tags } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/products", icon: Package, label: "Productos" },
  { to: "/stores", icon: Store, label: "Tiendas" },
  { to: "/categories", icon: Tags, label: "Categorías" },
  { to: "/config", icon: Settings, label: "Config" },
];

export default function AppLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground sticky top-0 h-screen p-4 gap-2">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-brand grid place-items-center font-black text-brand-foreground">K</div>
          <span className="text-lg font-bold tracking-tight">Katenda</span>
        </Link>
        {navItems.map((it) => {
          const active = isActive(it.to, it.exact);
          return (
            <Link key={it.to} to={it.to}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active ? "bg-brand/15 text-brand" : "hover:bg-sidebar-accent text-sidebar-foreground/80")}>
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
        <div className="mt-auto">
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-sidebar-accent text-sidebar-foreground/80">
            <Settings className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-24 md:pb-0 p-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
        <div className="glass-blur border border-border/60 rounded-2xl shadow-2xl flex items-center justify-around px-2 py-2">
          {navItems.map((it) => {
            const active = isActive(it.to, it.exact);
            return (
              <Link key={it.to} to={it.to}
                className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                  active ? "text-brand" : "text-muted-foreground")}>
                <it.icon className={cn("h-5 w-5", active && "scale-110")} />
                <span className="text-[10px] font-medium">{it.label}</span>
              </Link>
            );
          })}
          <button onClick={() => { logout(); navigate("/login"); }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground">
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-medium">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
