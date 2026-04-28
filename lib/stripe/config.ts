import type { SubscriptionPlan } from '@/lib/supabase/types'

export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
} as const

export const FREE_LIMITS = {
  puzzleLimit: 10,
  analysisDepth: 12,
  boardThemes: ['classic'],
  pieceThemes: ['classic'],
} as const

export const PRO_LIMITS = {
  puzzleLimit: Infinity,
  analysisDepth: 18,
  boardThemes: ['classic', 'marble', 'cyberpunk', 'tournament'],
  pieceThemes: ['classic', 'modern', 'pixel'],
} as const

export function planFromPriceId(priceId: string): SubscriptionPlan {
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return 'pro'
  if (priceId === process.env.STRIPE_PRICE_TEAM_MONTHLY) return 'team'
  return 'free'
}

export function toISO(unixTs: number): string {
  return new Date(unixTs * 1000).toISOString()
}
