'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { FREE_LIMITS, PRO_LIMITS } from '@/lib/stripe/config'
import { useToast } from '@/hooks/use-toast'
import type { Subscription } from '@/lib/supabase/types'

export interface UseSubscriptionReturn {
  subscription: Subscription | null
  loading: boolean
  isPro: boolean
  isTeam: boolean
  isFree: boolean
  isTrialing: boolean
  isCanceled: boolean
  isPastDue: boolean
  puzzleLimit: number
  analysisDepth: number
  canAccessBoardThemes: boolean
  renewalDate: Date | null
  startCheckout: (plan: 'pro') => Promise<void>
  openBillingPortal: () => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, profile } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSubscription(data)
        setLoading(false)
      })

    const channelName = `sub:${user.id}`

    const stale = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`)
    if (stale) supabase.removeChannel(stale)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setSubscription(payload.new as Subscription)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const activeStatus = subscription?.status === 'active' || subscription?.status === 'trialing'

  const isPro = loading
    ? (profile?.is_pro ?? false)
    : activeStatus && (subscription?.plan === 'pro' || subscription?.plan === 'team')

  const isTeam = activeStatus && subscription?.plan === 'team'
  const isFree = !isPro
  const isTrialing = subscription?.status === 'trialing'
  const isCanceled = subscription?.cancel_at_period_end ?? false
  const isPastDue = subscription?.status === 'past_due'

  const limits = isPro ? PRO_LIMITS : FREE_LIMITS

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null

  const startCheckout = useCallback(
    async (_plan: 'pro') => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: _plan, returnUrl: window.location.href }),
        })
        const data = await res.json()
        if (data.error) {
          toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
          return
        }
        window.location.href = data.url
      } catch {
        toast({ title: 'Ошибка', description: 'Не удалось открыть оплату', variant: 'destructive' })
      }
    },
    [toast]
  )

  const openBillingPortal = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      })
      const data = await res.json()
      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return
      }
      window.location.href = data.url
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось открыть портал управления',
        variant: 'destructive',
      })
    }
  }, [toast])

  return {
    subscription,
    loading,
    isPro,
    isTeam,
    isFree,
    isTrialing,
    isCanceled,
    isPastDue,
    puzzleLimit: limits.puzzleLimit,
    analysisDepth: limits.analysisDepth,
    canAccessBoardThemes: isPro,
    renewalDate,
    startCheckout,
    openBillingPortal,
  }
}
