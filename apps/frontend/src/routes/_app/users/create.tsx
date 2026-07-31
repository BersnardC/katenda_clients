import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/_app/users/create')({
  component: CreateUserPage,
})

function CreateUserPage() {
  const { t } = useI18n()
  return <PlaceholderPage title={t('nav.users')} />
}
