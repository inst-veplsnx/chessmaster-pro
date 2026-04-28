'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Users, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame'
import { cn } from '@/lib/utils'

const TIME_CONTROLS = [
  { label: 'Пуля', sub: '1+0', initial: 60, increment: 0 },
  { label: 'Блиц', sub: '3+2', initial: 180, increment: 2 },
  { label: 'Рапид', sub: '10+0', initial: 600, increment: 0 },
  { label: 'Классика', sub: '30+0', initial: 1800, increment: 0 },
]

export default function OnlineLobbyPage() {
  const router = useRouter()
  const mp = useMultiplayerGame()

  useEffect(() => {
    if (mp.gameId && mp.gameState) {
      router.push(`/play/online/${mp.gameId}`)
    }
  }, [mp.gameId, mp.gameState, router])

  function handleFind(tc: (typeof TIME_CONTROLS)[0]) {
    mp.findGame({ timeControl: { initial: tc.initial, increment: tc.increment }, rated: true })
  }

  const isConnected = mp.connectionStatus === 'connected'
  const isError = mp.connectionStatus === 'error'

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Онлайн-партия</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Играйте с живыми соперниками в реальном времени
          </p>
        </div>

        {/* Connection status */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm',
            isConnected
              ? 'border-green-500/30 bg-green-500/5 text-green-400'
              : isError
                ? 'border-red-500/30 bg-red-500/5 text-red-400'
                : 'border-border/60 bg-secondary/30 text-muted-foreground'
          )}
        >
          {isConnected ? (
            <Wifi className="h-4 w-4" />
          ) : isError ? (
            <WifiOff className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {isConnected
            ? 'Подключено к серверу'
            : isError
              ? 'Ошибка подключения. Проверьте, запущен ли WS-сервер.'
              : 'Подключение…'}
        </div>

        {mp.isSearching ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="font-semibold">Поиск соперника…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ожидайте, подбираем равного соперника
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Выберите контроль времени
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.sub}
                  disabled={!isConnected}
                  onClick={() => handleFind(tc)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    'border-border/60 bg-card/60 hover:border-primary/50 hover:bg-primary/5',
                    'disabled:cursor-not-allowed disabled:opacity-40'
                  )}
                >
                  <p className="text-sm font-bold">{tc.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{tc.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => router.back()}>
          Назад
        </Button>
      </div>
    </div>
  )
}
