export interface RoleRef {
  id: number;
  name: string;
  scope: string;
}

export interface ActiveAccountRef {
  id: number;
  uuid: string;
  name: string;
  status: number;
}

// Cuenta a la que el usuario pertenece (membresía activa o no), para el switcher.
export interface MemberAccount {
  id: number;
  uuid: string;
  name: string;
  role: string | null;
  status: number;
  is_active: boolean;
}

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  status: number;
  active_account_id: number | null;
  activeAccount?: ActiveAccountRef | null;
  role?: RoleRef[] | RoleRef | null;
  accounts?: MemberAccount[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiMessage {
  message: string;
}
