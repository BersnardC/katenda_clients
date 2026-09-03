import { api } from "@/lib/api";
import type {
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  User,
} from "@/types/auth";

export interface UpdateProfileDto {
  name?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export const authService = {
  login: (data: LoginDto) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterDto) =>
    api.post<AuthResponse>("/auth/register", data),
  logout: () => api.post<{ message: string }>("/auth/logout"),
  // PUT /user -> { user }
  updateProfile: (data: UpdateProfileDto) =>
    api.put<{ user: User }>("/user", data),
  // POST /auth/password/email -> { message }
  forgotPassword: (data: ForgotPasswordDto) =>
    api.post<{ message: string }>("/auth/password/email", data),
  // POST /auth/password/reset -> { message }
  resetPassword: (data: ResetPasswordDto) =>
    api.post<{ message: string }>("/auth/password/reset", data),
};
