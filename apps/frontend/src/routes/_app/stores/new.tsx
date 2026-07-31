import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/_app/stores/new')({
  component: NewStorePage,
})

function NewStorePage() {
  const { t } = useI18n()
  return <PlaceholderPage title={t('catalogs.new')} />
}
