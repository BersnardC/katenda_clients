import { createFileRoute } from '@tanstack/react-router'
import { MobileShell } from '@/components/MobileShell'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/store/$slug')({
  component: StorefrontPage,
})

function StorefrontPage() {
  const { t } = useI18n()
  return (
    <MobileShell hideNav>
      <PlaceholderPage title={t('store.products')} />
    </MobileShell>
  )
}
