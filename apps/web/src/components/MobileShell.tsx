import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Store,
  PlusCircle,
  MapPin,
  User,
  Tags,
  Boxes,
  Users,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/Logo";

export function MobileShell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {!hideNav && <SideNav />}
      <div
        className={
          hideNav
            ? "mx-auto w-full max-w-[480px] min-h-screen relative"
            : "w-full md:pl-64"
        }
      >
        <div
          className={
            hideNav
              ? "min-h-screen"
              : "mx-auto w-full max-w-[480px] min-h-screen relative md:max-w-[560px] md:px-5 lg:max-w-[640px]"
          }
        >
          <main className={hideNav ? "" : "pb-24 md:pb-8"}>{children}</main>
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}

function useNavItems() {
  const { t } = useI18n();
  const items: Array<{
    to: string;
    icon: typeof Home;
    label: string;
    accent?: boolean;
    desktopOnly?: boolean;
  }> = [
    { to: "/dashboard", icon: Home, label: t("nav.home") },
    { to: "/publish", icon: PlusCircle, label: t("nav.publish"), accent: true },
    { to: "/shops", icon: MapPin, label: t("nav.shops") },
    { to: "/categories", icon: Tags, label: t("nav.categories"), desktopOnly: true },
    { to: "/products", icon: Boxes, label: t("nav.inventory"), desktopOnly: true },
    { to: "/users", icon: Users, label: t("nav.users"), desktopOnly: true },
    { to: "/roles", icon: ShieldCheck, label: t("nav.roles"), desktopOnly: true },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];
  return items;
}

function isActivePath(pathname: string, to: string) {
  return to === "/dashboard"
    ? pathname === "/dashboard"
    : pathname === to || pathname.startsWith(to + "/");
}

function SideNav() {
  const items = useNavItems();
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border bg-surface/60 backdrop-blur z-40">
      <div className="px-5 py-6">
        <Logo size={36} />
      </div>
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = isActivePath(pathname, it.to);
            const Icon = it.icon;
            if (it.accent) {
              return (
                <li key={it.to} className="py-2">
                  <Link
                    to={it.to}
                    className="flex items-center gap-3 px-4 h-12 rounded-2xl gradient-brand text-primary-foreground shadow-pop font-semibold"
                  >
                    <Icon className="size-5" />
                    <span>{it.label}</span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className={`flex items-center gap-3 px-4 h-11 rounded-xl transition font-medium ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="text-sm">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function BottomNav() {
  const items = useNavItems().filter((i) => !i.desktopOnly);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-40">
      <div className="mx-3 mb-3 glass border border-border rounded-3xl shadow-soft">
        <ul className="flex items-center justify-between px-2 py-2">
          {items.map((it) => {
            const active = isActivePath(pathname, it.to);
            const Icon = it.icon;
            if (it.accent) {
              return (
                <li key={it.to} className="-mt-6">
                  <Link
                    to={it.to}
                    className="grid place-items-center w-14 h-14 rounded-2xl gradient-brand shadow-pop text-primary-foreground"
                    aria-label={it.label}
                  >
                    <Icon className="size-7" />
                  </Link>
                </li>
              );
            }
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="text-[10px] font-medium">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
