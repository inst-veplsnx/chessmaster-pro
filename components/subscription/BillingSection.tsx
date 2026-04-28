'use client'

import Link from 'next/link'
import { Crown, AlertTriangle, CreditCard, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanBadge } from '@/components/subscription/PlanBadge'
import { useSubscription } from '@/hooks/useSubscription'

export function BillingSection() {
  const {
    loading,
    isPro,
    isTeam,
    isFree,
    isTrialing,
    isCanceled,
    isPastDue,
    renewalDate,
    openBillingPortal,
  } = useSubscription()

  const currentPlan = isTeam ? 'team' : isPro ? 'pro' : 'free'

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Подписка</h2>

      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Текущий план</span>
            <PlanBadge plan={currentPlan} />
            {isTrialing && (
              <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                Пробный период
              </span>
            )}
          </div>
        </div>

        {!loading && (
          <>
            {isPastDue && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-400">Ошибка оплаты</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Не удалось списать средства. Обновите платёжные данные.
                  </p>
                </div>
              </div>
            )}

            {isCanceled && renewalDate && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <Calendar className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-400">Подписка отменена</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Доступ сохраняется до {formatDate(renewalDate)}
                  </p>
                </div>
              </div>
            )}

            {isPro && !isCanceled && !isPastDue && renewalDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5" />
                {isTrialing ? 'Первое списание' : 'Следующее списание'}: {formatDate(renewalDate)}
              </div>
            )}

            <div className="flex gap-2">
              {isFree ? (
                <Button size="sm" className="gap-1.5" asChild>
                  <Link href="/pricing">
                    <Crown className="h-3.5 w-3.5" />
                    Перейти на Pro
                  </Link>
                </Button>
              ) : isPastDue ? (
                <Button size="sm" variant="destructive" onClick={openBillingPortal}>
                  Обновить карту
                </Button>
              ) : isCanceled ? (
                <Button size="sm" onClick={openBillingPortal}>
                  Возобновить подписку
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={openBillingPortal}>
                  Управление подпиской
                </Button>
              )}
            </div>
          </>
        )}

        {loading && <div className="h-8 w-40 rounded-lg bg-secondary animate-pulse" />}
      </div>
    </div>
  )
}
