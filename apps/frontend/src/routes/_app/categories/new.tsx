import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/_app/categories/new')({
  component: NewCategoryPage,
})

function NewCategoryPage() {
  const { t } = useI18n()
  return <PlaceholderPage title={t('categories.new')} />
}
