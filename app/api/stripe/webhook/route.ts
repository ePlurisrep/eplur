import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Helper: update billing row for user_id
  async function upsertBilling(userId: string, subscription: Stripe.Subscription) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { getAll() { return [] }, setAll() {} }
    })

    const status = subscription.status
    const plan = subscription.items.data[0]?.price?.nickname || subscription.items.data[0]?.price?.id || null
    const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null

    const { data } = await supabase.from('billing').select('user_id').eq('user_id', userId).single()
    if (data) {
      await supabase.from('billing').update({ subscription_id: subscription.id, status, plan, current_period_end: currentPeriodEnd, updated_at: new Date().toISOString() }).eq('user_id', userId)
    } else {
      await supabase.from('billing').insert({ user_id: userId, subscription_id: subscription.id, status, plan, current_period_end: currentPeriodEnd })
    }
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        // Assume customer metadata stores Supabase user_id
        const userId = subscription.metadata?.supabase_user_id
        if (userId) await upsertBilling(userId, subscription)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        // Optionally update billing status via retrieving subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.supabase_user_id
        if (userId) await upsertBilling(userId, subscription)
        break
      }
      case 'customer.subscription.trial_will_end':
      default:
        // ignore other events for now
        break
    }
  } catch (err) {
    console.error('Error handling stripe webhook:', err)
    return NextResponse.json({ error: 'Internal webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
