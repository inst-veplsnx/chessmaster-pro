'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Swords, Brain, BarChart3, Trophy, User, Settings, Zap, LineChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

const NAV = [
  { href: '/play', icon: Swords, label: 'Играть' },
  { href: '/puzzles', icon: Brain, label: 'Задачи' },
  { href: '/analysis', icon: BarChart3, label: 'Анализ' },
  { href: '/leaderboard', icon: Trophy, label: 'Рейтинг' },
  { href: '/stats', icon: LineChart, label: 'Статистика' },
  { href: '/profile', icon: User, label: 'Профиль' },
]

const BOTTOM = [
  { href: '/settings', icon: Settings, label: 'Настройки' },
  { href: '/pricing', icon: Zap, label: 'Pro', pro: true },
]

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  pro,
  onClick,
}: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
  pro?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        pro && !active && 'hover:text-amber-400'
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
          pro && !active && 'group-hover:text-amber-400'
        )}
      />
      <span className="truncate">{label}</span>
      {pro && (
        <span className="ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
          PRO
        </span>
      )}
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname()

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 border-b border-border/60 px-4 py-4"
      >
        <div className="relative h-7 w-7 shrink-0">
          <Image src="/pieces/classic/wN.svg" alt="Knight" fill unoptimized />
        </div>
        <div className="leading-none">
          <p className="font-serif text-sm font-bold">ChessMaster</p>
          <p className="text-[10px] text-muted-foreground">Pro</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={path === item.href || path.startsWith(item.href + '/')}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-border/60 px-3 py-3 space-y-0.5">
        {BOTTOM.map((item) => (
          <NavItem key={item.href} {...item} active={path === item.href} onClick={onNavigate} />
        ))}
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-border/60 bg-card/50 backdrop-blur-sm">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="p-0 bg-card border-border/60">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  )
}
