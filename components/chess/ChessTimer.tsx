'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Color } from '@/lib/engine/types'

export interface TimeControl {
  initial: number
  increment: number
}

export const TIME_CONTROLS: Record<string, TimeControl> = {
  bullet: { initial: 60_000, increment: 0 },
  blitz: { initial: 180_000, increment: 2_000 },
  rapid: { initial: 600_000, increment: 0 },
  classical: { initial: 1_800_000, increment: 0 },
}

interface ChessTimerProps {
  timeWhite: number
  timeBlack: number
  activeColor: Color | null
  onTimeout: (color: Color) => void
}

function formatTime(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

interface TimerDisplayProps {
  time: number
  color: Color
  isActive: boolean
}

function TimerDisplay({ time, isActive }: TimerDisplayProps) {
  const isLow = time < 30_000
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg px-4 py-2 font-mono text-2xl font-bold transition-all',
        isActive ? 'bg-foreground text-background scale-105' : 'bg-muted text-muted-foreground',
        isLow && isActive && 'text-red-500'
      )}
    >
      {formatTime(time)}
    </div>
  )
}

export function ChessTimer({ timeWhite, timeBlack, activeColor, onTimeout }: ChessTimerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!activeColor) return

    lastTickRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickRef.current
      lastTickRef.current = now

      if (activeColor === 'white' && timeWhite - elapsed <= 0) {
        clearInterval(intervalRef.current!)
        onTimeout('white')
      } else if (activeColor === 'black' && timeBlack - elapsed <= 0) {
        clearInterval(intervalRef.current!)
        onTimeout('black')
      }
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeColor, timeWhite, timeBlack, onTimeout])

  return (
    <div className="flex flex-col gap-2 w-full">
      <TimerDisplay time={timeBlack} color="black" isActive={activeColor === 'black'} />
      <TimerDisplay time={timeWhite} color="white" isActive={activeColor === 'white'} />
    </div>
  )
}
