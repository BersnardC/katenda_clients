import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, type LoginDto, type RegisterDto } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";

interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  status: number;
  active_account_id: number | null;
  activeAccount?: {
    id: number;
    uuid: string;
    name: string;
    status: number;
  } | null;
  role?: {
    id: number;
    name: string;
    scope: string;
  } | null;
}

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
  return localStorage.getItem("access_token");
}

function getStoredUser(): User | null {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    setToken(t);
    setUser(u);
  }, []);

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (res) => {
      const { user: u, token: t } = res.data;
      setUser(u);
      setToken(t);
      persistToken(t);
      persistUser(u);
      toast.success("Sesión iniciada correctamente");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      toast.error(msg);
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (res) => {
      const { user: u, token: t } = res.data;
      setUser(u);
      setToken(t);
      persistToken(t);
      persistUser(u);
      toast.success("Cuenta creada correctamente");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const msg = error.response?.data?.message || "Error al registrarse";
      toast.error(msg);
      throw error;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      setUser(null);
      setToken(null);
      persistToken(null);
      persistUser(null);
      localStorage.removeItem("katenda.active_store");
      queryClient.clear();
      toast.success("Sesión cerrada");
    },
  });

  const login = useCallback(async (data: LoginDto) => {
    setLoading(true);
    try {
      await loginMutation.mutateAsync(data);
    } finally {
      setLoading(false);
    }
  }, [loginMutation]);

  const register = useCallback(async (data: RegisterDto) => {
    setLoading(true);
    try {
      await registerMutation.mutateAsync(data);
    } finally {
      setLoading(false);
    }
  }, [registerMutation]);

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
