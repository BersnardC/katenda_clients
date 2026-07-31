import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from '@tanstack/react-router'
import { Mail, Lock, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/lib/i18n'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Field } from '@/components/auth/Field'
import { Divider } from '@/components/auth/Divider'
import { SocialBtn } from '@/components/auth/SocialBtn'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { register, user, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !passwordConfirmation) return
    if (password !== passwordConfirmation) return
    setSubmitting(true)
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
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

  const passwordMismatch =
    password !== passwordConfirmation && passwordConfirmation.length > 0

  return (
    <AuthLayout title={t('auth.createTitle')} subtitle={t('auth.createSub')}>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <Field
          icon={<UserIcon className="size-5" />}
          placeholder={t('auth.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <Field
          icon={<Lock className="size-5" />}
          placeholder={t('auth.passwordConfirm')}
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        {passwordMismatch && (
          <p className="text-xs text-destructive">
            {t('auth.passwordMismatch')}
          </p>
        )}
        <button
          disabled={submitting || loading || passwordMismatch}
          className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop disabled:opacity-60"
        >
          {submitting || loading ? t('common.loading') : t('cta.register')}
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
        {t('auth.hasAccount')}{' '}
        <Link to="/auth/login" className="text-primary font-semibold">
          {t('cta.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
