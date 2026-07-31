import type { ReactNode } from 'react'

export function MobileShell({
  children,
  hideNav = false,
}: {
  children: ReactNode
  hideNav?: boolean
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className={
          hideNav
            ? 'mx-auto w-full max-w-[480px] min-h-screen relative'
            : 'w-full md:pl-64'
        }
      >
        <div
          className={
            hideNav
              ? 'min-h-screen'
              : 'mx-auto w-full max-w-[480px] min-h-screen relative md:max-w-[560px] md:px-5 lg:max-w-[640px]'
          }
        >
          <main className={hideNav ? '' : 'pb-24 md:pb-8'}>{children}</main>
        </div>
      </div>
    </div>
  )
}
