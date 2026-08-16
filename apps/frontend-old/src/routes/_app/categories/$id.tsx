import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/categories/$id')({
  component: () => <Outlet />,
})
