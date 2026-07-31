import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from '@tanstack/react-router'
import { Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/lib/i18n'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Field } from '@/components/auth/Field'
import { Divider } from '@/components/auth/Divider'
import { SocialBtn } from '@/components/auth/SocialBtn'

export const Route = createFileRoute('/auth/login')({ component: LoginPage })

function LoginPage() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { login, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    try {
      await login({ email, password })
      nav({ to: '/dashboard' })
    } catch {
      // error handled in AuthContext
    } finally {
      setSubmitting(false)
    }
  }

  const social = (label: string) => {
    toast.info(`${label} (simulado)`)
    setTimeout(() => nav({ to: '/dashboard' }), 600)
  }

  return (
    <AuthLayout title={t('auth.welcome')} subtitle={t('auth.welcomeSub')}>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <Field
          icon={<Mail className="size-5" />}
          placeholder={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          icon={<Lock className="size-5" />}
          placeholder={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Link
          to="/auth/recoverypass"
          className="block text-right text-sm text-primary font-medium"
        >
          {t('auth.forgot')}
        </Link>
        <button
          disabled={submitting || loading}
          className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop disabled:opacity-60"
        >
          {submitting || loading ? t('common.loading') : t('cta.login')}
        </button>
      </form>

      <Divider label={t('auth.or')} />

      <div className="space-y-3">
        <SocialBtn onClick={() => social('Google')} brand="google">
          {t('cta.continueGoogle')}
        </SocialBtn>
        <SocialBtn onClick={() => social('WhatsApp')} brand="whatsapp">
          {t('cta.continueWhatsapp')}
        </SocialBtn>
      </div>

      <p className="mt-auto text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/auth/register" className="text-primary font-semibold">
          {t('cta.register')}
        </Link>
      </p>
    </AuthLayout>
  )
}
