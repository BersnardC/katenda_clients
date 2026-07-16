// src/services/authService.ts
import api from "./api";

export type LoginDto = { email: string; password: string };
export type RegisterDto = { name: string; email: string; password: string };

export const authService = {
  login: (data: LoginDto) => api.post("/auth/login", data),
  register: (data: RegisterDto) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};
