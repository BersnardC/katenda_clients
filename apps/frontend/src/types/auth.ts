export interface User {
  id: number
  uuid: string
  name: string
  email: string
  status: number
  active_account_id: number | null
  activeAccount?: {
    id: number
    uuid: string
    name: string
    status: number
  } | null
  role?: {
    id: number
    name: string
    scope: string
  } | null
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiMessage {
  message: string
}
