import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/lib/i18n'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { t } = useI18n()

  if (loading) {
    return (
      <div className="p-4 text-muted-foreground">{t('common.loading')}</div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}
