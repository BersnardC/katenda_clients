import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/authService";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import type { ApiMessage, LoginDto, RegisterDto, User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("katenda.user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistToken(token: string | null) {
  if (token) localStorage.setItem("access_token", token);
  else localStorage.removeItem("access_token");
}

function persistUser(user: User | null) {
  if (user) localStorage.setItem("katenda.user", JSON.stringify(user));
  else localStorage.removeItem("katenda.user");
}

function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as ApiMessage).message);
  }
  return fallback;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getStoredToken());
    setUser(getStoredUser());
  }, []);

  const login = useCallback(
    async (data: LoginDto) => {
      setLoading(true);
      try {
        const res = await authService.login(data);
        setUser(res.user);
        setToken(res.token);
        persistToken(res.token);
        persistUser(res.user);
        toast.success(t("auth.loginSuccess"));
      } catch (e) {
        toast.error(errorMessage(e, t("auth.loginError")));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const register = useCallback(
    async (data: RegisterDto) => {
      setLoading(true);
      try {
        const res = await authService.register(data);
        setUser(res.user);
        setToken(res.token);
        persistToken(res.token);
        persistUser(res.user);
        toast.success(t("auth.registerSuccess"));
      } catch (e) {
        toast.error(errorMessage(e, t("auth.registerError")));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    setUser(null);
    setToken(null);
    persistToken(null);
    persistUser(null);
    localStorage.removeItem("katenda.active_store");
    toast.success(t("auth.logoutSuccess"));
  }, [t]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
