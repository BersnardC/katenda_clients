import { Link, useNavigate } from "react-router-dom";
import {
  Crown,
  Globe,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  BarChart3,
  MessageCircle,
  CreditCard,
  User,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useSubscription } from "@/hooks/useAccount";
import { MemberAccountRows } from "@/components/accounts/AccountSwitcher";

export function Component() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { data: subData } = useSubscription();
  const navigate = useNavigate();

  const planName = subData?.subscription?.plan?.name;
  const role = Array.isArray(user?.role) ? user?.role[0] : user?.role;
  const accountsCount = user?.accounts?.length ?? 0;
  const initials = (user?.name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3">
        <h1 className="font-display font-bold text-2xl">{t("profile.title")}</h1>
      </header>

      <section className="relative mx-5 mt-2 p-5 rounded-3xl gradient-brand text-primary-foreground shadow-pop">
        <Link
          to="/profile/edit"
          className="absolute top-4 right-4 size-9 rounded-full bg-white/20 grid place-items-center text-primary-foreground"
          aria-label={t("profile.edit")}
        >
          <Pencil className="size-4" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-white/20 grid place-items-center font-display font-extrabold text-2xl">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-xl truncate">
              {user?.name}
            </p>
            <p className="text-sm opacity-80 truncate">{user?.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {role?.name && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                  <ShieldCheck className="size-3" /> {role.name}
                </span>
              )}
              {planName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                  <Crown className="size-3" /> {planName}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {accountsCount > 1 && (
        <section className="px-5 mt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            {t("accounts.title")}
          </p>
          <MemberAccountRows />
        </section>
      )}

      <section className="px-5 mt-6 space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          {t("profile.settings")}
        </p>

        <LinkRow
          to="/profile/account"
          icon={<User className="size-5" />}
          label={t("profile.account")}
        />

        <Row icon={<Globe className="size-5" />} label={t("profile.lang")}>
          <div className="flex bg-surface rounded-full p-1">
            <button
              type="button"
              onClick={() => setLang("es")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                lang === "es"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                lang === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              EN
            </button>
          </div>
        </Row>

        <Row
          icon={
            theme === "dark" ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )
          }
          label={t("profile.theme")}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={t("profile.theme")}
            className={`relative w-12 h-7 rounded-full transition ${
              theme === "dark" ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${
                theme === "dark" ? "left-6" : "left-1"
              }`}
            />
          </button>
        </Row>

        <LinkRow
          to="/plans"
          icon={<Crown className="size-5" />}
          label={t("profile.plan")}
        />
        <LinkRow
          to="/payments"
          icon={<CreditCard className="size-5" />}
          label={t("pay.title")}
        />
        <LinkRow
          to="/whatsapp"
          icon={<MessageCircle className="size-5" />}
          label={t("wa.title")}
        />
        <LinkRow
          to="/admin"
          icon={<BarChart3 className="size-5" />}
          label={t("admin.title")}
        />

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border text-destructive w-full"
        >
          <LogOut className="size-5" />
          <span className="font-medium">{t("profile.logout")}</span>
        </button>
      </section>
    </>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border">
      <span className="text-primary">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      {children}
    </div>
  );
}

function LinkRow({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border"
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
