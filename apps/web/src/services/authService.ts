import { api } from "@/lib/api";
import type { AuthResponse, LoginDto, RegisterDto } from "@/types/auth";

export const authService = {
  login: (data: LoginDto) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterDto) =>
    api.post<AuthResponse>("/auth/register", data),
  logout: () => api.post<{ message: string }>("/auth/logout"),
};
