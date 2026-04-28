import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  title: {
    default: 'ChessMaster Pro',
    template: '%s | ChessMaster Pro',
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-background">
        {/* Sidebar — скрыт на мобильных */}
        <div className="hidden lg:flex h-full">
          <Sidebar />
        </div>

        {/* Основная область */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
