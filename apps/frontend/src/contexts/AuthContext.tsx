import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiMessage, LoginDto, RegisterDto, User } from '@/types/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('katenda.user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistToken(token: string | null) {
  if (token) localStorage.setItem('access_token', token)
  else localStorage.removeItem('access_token')
}

function persistUser(user: User | null) {
  if (user) localStorage.setItem('katenda.user', JSON.stringify(user))
  else localStorage.removeItem('katenda.user')
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [token, setToken] = useState<string | null>(getStoredToken)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setToken(getStoredToken())
    setUser(getStoredUser())
  }, [])

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (res) => {
      const { user: u, token: tkn } = res.data
      setUser(u)
      setToken(tkn)
      persistToken(tkn)
      persistUser(u)
      toast.success(t('auth.loginSuccess'))
    },
    onError: (error: AxiosError<ApiMessage>) => {
      const msg = error.response?.data.message || t('auth.loginError')
      toast.error(msg)
      throw error
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (res) => {
      const { user: u, token: tkn } = res.data
      setUser(u)
      setToken(tkn)
      persistToken(tkn)
      persistUser(u)
      toast.success(t('auth.registerSuccess'))
    },
    onError: (error: AxiosError<ApiMessage>) => {
      const msg = error.response?.data.message || t('auth.registerError')
      toast.error(msg)
      throw error
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      setUser(null)
      setToken(null)
      persistToken(null)
      persistUser(null)
      localStorage.removeItem('katenda.active_store')
      queryClient.clear()
      toast.success(t('auth.logoutSuccess'))
    },
  })

  const login = useCallback(
    async (data: LoginDto) => {
      setLoading(true)
      try {
        await loginMutation.mutateAsync(data)
      } finally {
        setLoading(false)
      }
    },
    [loginMutation],
  )

  const register = useCallback(
    async (data: RegisterDto) => {
      setLoading(true)
      try {
        await registerMutation.mutateAsync(data)
      } finally {
        setLoading(false)
      }
    },
    [registerMutation],
  )

  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
