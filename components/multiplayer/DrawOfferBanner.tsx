'use client'

import { Button } from '@/components/ui/button'

interface DrawOfferBannerProps {
  onAccept: () => void
  onDecline: () => void
}

export function DrawOfferBanner({ onAccept, onDecline }: DrawOfferBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3">
      <p className="text-sm font-medium">Соперник предлагает ничью</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onDecline} className="h-7 text-xs">
          Отклонить
        </Button>
        <Button size="sm" onClick={onAccept} className="h-7 text-xs">
          Принять
        </Button>
      </div>
    </div>
  )
}
