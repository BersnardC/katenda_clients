import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/_app/shops')({ component: ShopsPage })

function ShopsPage() {
  const { t } = useI18n()
  return <PlaceholderPage title={t('shops.title')} />
}
