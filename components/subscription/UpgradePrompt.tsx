'use client'

import { Lock, Crown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/hooks/useSubscription'

interface UpgradePromptProps {
  feature: 'puzzles' | 'analysis' | 'themes'
  variant?: 'inline' | 'banner'
  lockedCount?: number
  className?: string
}

const FEATURE_LABELS: Record<UpgradePromptProps['feature'], string> = {
  puzzles: 'задач',
  analysis: 'глубина анализа',
  themes: 'темы доски',
}

export function UpgradePrompt({
  feature,
  variant = 'banner',
  lockedCount,
  className,
}: UpgradePromptProps) {
  const { startCheckout, loading } = useSubscription()

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3',
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            {lockedCount !== undefined ? (
              <>
                Ещё <span className="font-semibold text-foreground">{lockedCount}</span>{' '}
                {FEATURE_LABELS[feature]} доступно в Pro
              </>
            ) : (
              <>Эта функция доступна в Pro</>
            )}
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={loading}
          onClick={() => startCheckout('pro')}
        >
          <Crown className="h-3.5 w-3.5" />
          Открыть Pro
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3',
        className
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Lock className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">Функция Pro</p>
        <p className="text-xs text-muted-foreground truncate">
          Перейдите на Pro для доступа к этой функции
        </p>
      </div>
      <Button size="sm" variant="outline" asChild className="shrink-0">
        <Link href="/pricing">Подробнее</Link>
      </Button>
    </div>
  )
}
