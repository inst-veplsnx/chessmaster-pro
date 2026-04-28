'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Zap, Users, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/hooks/useSubscription'
import { useToast } from '@/hooks/use-toast'

const PLANS = [
  {
    key: 'free' as const,
    name: 'Бесплатно',
    price: '0',
    period: 'навсегда',
    icon: Zap,
    color: 'text-muted-foreground',
    border: 'border-border/60',
    badge: null,
    features: [
      { text: '10 партий против ИИ в день', ok: true },
      { text: '10 обучающих задач', ok: true },
      { text: 'Анализ партий (глубина 12)', ok: true },
      { text: 'Классическая тема доски', ok: true },
      { text: 'Безлимитные партии против ИИ', ok: false },
      { text: 'Все темы доски и фигур', ok: false },
      { text: 'Полная база задач (276)', ok: false },
      { text: 'Анализ ИИ (глубина 18)', ok: false },
      { text: 'Приоритет в поиске соперника', ok: false },
    ],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: '9.99',
    period: 'в месяц',
    icon: Crown,
    color: 'text-primary',
    border: 'border-primary/40',
    badge: 'Популярно',
    features: [
      { text: 'Безлимитные партии против ИИ', ok: true },
      { text: 'Все 276 задач для интервью', ok: true },
      { text: 'Анализ партий (глубина 18)', ok: true },
      { text: 'Все 4 темы доски', ok: true },
      { text: 'Все 3 темы фигур', ok: true },
      { text: 'Приоритет в поиске соперника', ok: true },
      { text: 'Детальная аналитика', ok: true },
      { text: 'История всех партий', ok: true },
      { text: 'Командный доступ', ok: false },
    ],
  },
  {
    key: 'team' as const,
    name: 'Team',
    price: '29.99',
    period: 'в месяц',
    icon: Users,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badge: null,
    features: [
      { text: 'Всё включено из Pro', ok: true },
      { text: 'До 10 участников команды', ok: true },
      { text: 'Командный дашборд', ok: true },
      { text: 'Общий прогресс и статистика', ok: true },
      { text: 'Кастомные задачи для команды', ok: true },
      { text: 'Командные турниры', ok: true },
      { text: 'Приоритетная поддержка', ok: true },
      { text: 'API доступ', ok: true },
      { text: 'Брендирование интерфейса', ok: false },
    ],
  },
]

function getPlanAction(
  planKey: 'free' | 'pro' | 'team',
  sub: ReturnType<typeof useSubscription>
): { label: string; disabled: boolean; onClick?: () => void } {
  if (planKey === 'free') {
    if (sub.isFree) return { label: 'Текущий план', disabled: true }
    return { label: 'Downgrade', disabled: false, onClick: () => sub.openBillingPortal() }
  }

  if (planKey === 'pro') {
    if (sub.isTeam) {
      return { label: 'Включено в Team', disabled: true }
    }
    if (sub.isPro && !sub.isTeam) {
      if (sub.isCanceled) {
        return { label: 'Возобновить', disabled: false, onClick: () => sub.openBillingPortal() }
      }
      return {
        label: 'Управление подпиской',
        disabled: false,
        onClick: () => sub.openBillingPortal(),
      }
    }
    return {
      label: 'Начать 7 дней бесплатно',
      disabled: false,
      onClick: () => sub.startCheckout('pro'),
    }
  }

  // team
  return {
    label: 'Связаться с нами',
    disabled: false,
    onClick: () => {
      window.location.href = 'mailto:team@chessmasterpro.com'
    },
  }
}

function PricingContent() {
  const subscription = useSubscription()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      toast({ title: 'Подписка активирована!', description: 'Добро пожаловать в Pro.' })
    }
    if (searchParams.get('canceled') === '1') {
      toast({
        title: 'Оплата отменена',
        description: 'Вы можете вернуться в любой момент.',
        variant: 'destructive',
      })
    }
  }, [searchParams, toast])

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Выбери свой план</h1>
        <p className="text-sm text-muted-foreground">Начни бесплатно. Улучши когда будешь готов.</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const { key, name, price, period, icon: Icon, color, border, badge, features } = plan
          const action = getPlanAction(key, subscription)

          return (
            <div
              key={key}
              className={`relative rounded-2xl border ${border} bg-card/60 p-6 flex flex-col ${
                key === 'pro' ? 'shadow-lg shadow-primary/10' : ''
              }`}
            >
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground border-0 text-xs px-3">
                    {badge}
                  </Badge>
                </div>
              )}

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="font-bold">{name}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">/ {period}</span>
                </div>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {features.map(({ text, ok }) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm">
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        ok ? 'bg-green-500/20' : 'bg-muted'
                      }`}
                    >
                      <Check
                        className={`h-2.5 w-2.5 ${ok ? 'text-green-400' : 'text-muted-foreground/20'}`}
                      />
                    </div>
                    <span className={ok ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={key === 'pro' ? 'default' : 'outline'}
                className="w-full"
                disabled={action.disabled || subscription.loading}
                onClick={action.onClick}
              >
                {subscription.loading ? (
                  <span className="h-4 w-24 rounded bg-current/20 animate-pulse inline-block" />
                ) : (
                  action.label
                )}
              </Button>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
        <h2 className="font-semibold">Часто задаваемые вопросы</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              q: 'Можно ли отменить подписку?',
              a: 'Да, в любой момент. Доступ сохраняется до конца оплаченного периода.',
            },
            {
              q: 'Как работает пробный период?',
              a: '7 дней бесплатно при вводе карты. Списание произойдёт после окончания пробного периода.',
            },
            {
              q: 'Как работает Team план?',
              a: 'Один администратор оплачивает подписку и приглашает до 10 участников.',
            },
            {
              q: 'Есть ли студенческая скидка?',
              a: 'Да — 50% скидка для студентов по верификации .edu почты.',
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="text-sm font-medium">{q}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  )
}
