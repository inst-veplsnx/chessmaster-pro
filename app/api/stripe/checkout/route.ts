import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { PRICE_IDS } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { plan?: string; returnUrl?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { plan, returnUrl } = body

  if (plan !== 'pro') {
    return NextResponse.json(
      { error: 'Invalid plan. Use billing portal for other changes.' },
      { status: 400 }
    )
  }

  const origin = new URL(request.url).origin

  // Find or create Stripe customer
  const adminClient = createAdminClient()
  const { data: existingSub } = await adminClient
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  let customerId = existingSub?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRICE_IDS.pro_monthly, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { supabase_user_id: user.id, plan },
    },
    success_url: `${origin}/pricing?success=1`,
    cancel_url: returnUrl ?? `${origin}/pricing?canceled=1`,
    metadata: { supabase_user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
