import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { planFromPriceId, toISO } from '@/lib/stripe/config'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SubscriptionPlan } from '@/lib/supabase/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  try {
    await handleStripeEvent(event)
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break
    default:
      break
  }
}

// In Stripe v22, current_period_start/end live on SubscriptionItem, not Subscription
function getSubPeriod(stripeSub: Stripe.Subscription) {
  const item = stripeSub.items.data[0]
  return {
    current_period_start: item ? toISO(item.current_period_start) : null,
    current_period_end: item ? toISO(item.current_period_end) : null,
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id
  const plan = (session.metadata?.plan ?? 'pro') as SubscriptionPlan

  if (!userId || !session.subscription) return

  const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
  const period = getSubPeriod(stripeSub)
  const supabase = createAdminClient()

  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: stripeSub.id,
      plan,
      status: stripeSub.status as 'active' | 'trialing' | 'canceled' | 'past_due',
      current_period_start: period.current_period_start,
      current_period_end: period.current_period_end,
      cancel_at_period_end: stripeSub.cancel_at_period_end,
    },
    { onConflict: 'user_id' }
  )

  await supabase.from('profiles').update({ is_pro: true }).eq('id', userId)
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const supabase = createAdminClient()

  const { data: row } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', stripeSub.id)
    .maybeSingle()

  if (!row) return

  const priceId = stripeSub.items.data[0]?.price.id ?? ''
  const plan = planFromPriceId(priceId)
  const isActive = stripeSub.status === 'active' || stripeSub.status === 'trialing'
  const period = getSubPeriod(stripeSub)

  await supabase
    .from('subscriptions')
    .update({
      plan,
      status: stripeSub.status as 'active' | 'trialing' | 'canceled' | 'past_due',
      current_period_start: period.current_period_start,
      current_period_end: period.current_period_end,
      cancel_at_period_end: stripeSub.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', stripeSub.id)

  await supabase.from('profiles').update({ is_pro: isActive }).eq('id', row.user_id)
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  const supabase = createAdminClient()

  const { data: row } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', stripeSub.id)
    .maybeSingle()

  if (!row) return

  await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      cancel_at_period_end: false,
      stripe_subscription_id: null,
    })
    .eq('user_id', row.user_id)

  await supabase.from('profiles').update({ is_pro: false }).eq('id', row.user_id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // In Stripe v22, subscription is in invoice.parent.subscription_details.subscription
  const subId =
    invoice.parent?.type === 'subscription_details'
      ? (invoice.parent.subscription_details?.subscription as string | null)
      : null

  if (!subId) return

  const supabase = createAdminClient()
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subId)
  // is_pro stays true — user retains access during Stripe retry grace period
}
