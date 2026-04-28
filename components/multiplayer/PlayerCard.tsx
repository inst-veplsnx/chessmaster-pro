'use client'

import { cn } from '@/lib/utils'

interface PlayerCardProps {
  username: string
  rating: number
  color: 'white' | 'black'
  timeMs: number
  isActive: boolean
  isMyCard?: boolean
}

function formatTime(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function PlayerCard({
  username,
  rating,
  color,
  timeMs,
  isActive,
  isMyCard,
}: PlayerCardProps) {
  const isLow = timeMs < 30000 && timeMs > 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-2 transition-all',
        isActive ? 'border-primary/50 bg-primary/5' : 'border-border/60 bg-card/60'
      )}
    >
      <div
        className={cn(
          'h-8 w-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold',
          color === 'white'
            ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
            : 'bg-zinc-800 border-zinc-600 text-zinc-100'
        )}
      >
        {username.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold">{username}</span>
          {isMyCard && (
            <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              Вы
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{rating} Эло</span>
      </div>

      <div
        className={cn(
          'shrink-0 rounded-lg px-2.5 py-1 font-mono text-lg font-bold tabular-nums transition-colors',
          isActive && isLow
            ? 'bg-red-500/10 text-red-400'
            : isActive
              ? 'bg-primary/10 text-primary'
              : 'bg-secondary/60 text-muted-foreground'
        )}
      >
        {formatTime(timeMs)}
      </div>

      {isActive && (
        <div className="flex gap-0.5 shrink-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
