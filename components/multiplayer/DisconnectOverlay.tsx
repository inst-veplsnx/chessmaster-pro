'use client'

import { WifiOff } from 'lucide-react'

interface DisconnectOverlayProps {
  secondsLeft: number
}

export function DisconnectOverlay({ secondsLeft }: DisconnectOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
      <WifiOff className="mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-base font-semibold">Соперник отключился</p>
      <p className="mt-1 text-sm text-muted-foreground">Ожидание переподключения: {secondsLeft}с</p>
      <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-1000"
          style={{ width: `${(secondsLeft / 30) * 100}%` }}
        />
      </div>
    </div>
  )
}
