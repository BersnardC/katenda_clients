import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/lib/i18n'
import { Logo } from '@/components/Logo'
import { MobileShell } from '@/components/MobileShell'
import { RequireAuth } from '@/components/RequireAuth'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
})

function DashboardPage() {
  const { user, logout } = useAuth()
  const { t } = useI18n()

  return (
    <MobileShell hideNav>
      <div className="min-h-screen flex flex-col px-6 pt-6 pb-10">
        <div className="mt-8">
          <Logo />
        </div>
        <h1 className="mt-8 font-display font-bold text-3xl">
          {t('home.greeting')}, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        <button
          onClick={logout}
          className="mt-auto w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
        >
          {t('profile.logout')}
        </button>
      </div>
    </MobileShell>
  )
}
