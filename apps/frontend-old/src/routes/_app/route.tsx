import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MobileShell } from '@/components/MobileShell'
import { RequireAuth } from '@/components/RequireAuth'

export const Route = createFileRoute('/_app')({ component: AppLayout })

function AppLayout() {
  return (
    <RequireAuth>
      <MobileShell>
        <Outlet />
      </MobileShell>
    </RequireAuth>
  )
}
