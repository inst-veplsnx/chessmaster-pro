'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bell, LogIn, Menu, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { MobileSidebar } from './Sidebar'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()
  const subscription = useSubscription()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? 'Вы'

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
        <button
          className="lg:hidden cursor-pointer rounded-lg p-1.5 hover:bg-secondary transition-colors"
          aria-label="Открыть меню"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <h1 className="hidden text-sm font-semibold text-foreground sm:block">{title}</h1>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
          ) : user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 cursor-pointer"
                asChild
              >
                <button aria-label="Уведомления">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                </button>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Профиль</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/stats">Статистика</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Настройки</Link>
                  </DropdownMenuItem>
                  {!subscription.loading && subscription.isFree && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/pricing"
                          className="flex items-center gap-2 text-amber-400 font-semibold focus:text-amber-400"
                        >
                          <Crown className="h-3.5 w-3.5" />
                          Перейти на Pro
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" variant="outline" className="gap-2 h-8" asChild>
              <Link href="/login">
                <LogIn className="h-3.5 w-3.5" />
                Войти
              </Link>
            </Button>
          )}
        </div>
      </header>
    </>
  )
}
