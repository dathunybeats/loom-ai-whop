import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Plan configurations for Dodo Payments
const PLAN_CONFIGS = {
  'pdt_ScqkGM6dvih1xrlE04Lwo': { // Basic
    name: 'Basic',
    videos_limit: 100,
    price: '$49.99'
  },
  'pdt_hixMn0obmlZ9vyr02Gmgi': { // Pro
    name: 'Pro',
    videos_limit: 500,
    price: '$99'
  },
  'pdt_pyXVf4I6gL6TY4JkNmOCN': { // Agency
    name: 'Agency',
    videos_limit: -1, // Unlimited
    price: '$199'
  }
} as const

export async function POST(req: NextRequest) {
  const secret = process.env.DODO_WEBHOOK_SECRET

  // Read raw body first
  const raw = await req.text()
  let event: any = null

  try {
    event = raw ? JSON.parse(raw) : null
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!event) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // TODO: Re-enable signature verification once we understand Dodo's signing method
  console.log('🔔 Dodo webhook received')
  console.log('📋 Event:', event)

  try {
    const supabase = await createClient()

    // Handle different Dodo payment events
    const eventType = event?.type || event?.event_type
    const eventData = event?.data || event

    console.log('📝 Event type:', eventType)
    console.log('💾 Event data:', eventData)

    switch (eventType) {
      case 'payment.succeeded':
      case 'subscription.created':
      case 'subscription.renewed':
        await handleSuccessfulPayment(supabase, eventData)
        break

      case 'subscription.canceled':
      case 'subscription.cancelled':
        await handleCancelledSubscription(supabase, eventData)
        break

      case 'payment.failed':
        await handleFailedPayment(supabase, eventData)
        break

      default:
        console.log('🤷 Unhandled event type:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error('🚨 Webhook error:', e)
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

async function handleSuccessfulPayment(supabase: any, data: any) {
  console.log('✅ Processing successful payment')

  // Extract user information
  const userId = data?.metadata?.user_id
  const customerEmail = data?.customer?.email
  const productId = data?.product_id || data?.items?.[0]?.product_id

  // Extract subscription/payment details
  const subscriptionId = data?.subscription_id || data?.id
  const customerId = data?.customer?.id || data?.customer_id
  const checkoutSessionId = data?.checkout_session_id || data?.session_id

  if (!userId && !customerEmail) {
    console.error('❌ No user identifier found in webhook data')
    return
  }

  // Find user by ID or email
  let finalUserId = userId
  if (!finalUserId && customerEmail) {
    const { data: userRow } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single()

    finalUserId = userRow?.id
  }

  if (!finalUserId) {
    console.error('❌ Could not resolve user ID')
    return
  }

  // Get plan configuration
  const planConfig = PLAN_CONFIGS[productId as keyof typeof PLAN_CONFIGS]
  if (!planConfig) {
    console.error('❌ Unknown product ID:', productId)
    return
  }

  console.log('📦 Plan config:', planConfig)

  // Calculate billing period end (30 days from now)
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + 30)

  // Update user subscription
  const subscriptionData = {
    user_id: finalUserId,
    plan_id: productId,
    plan_name: planConfig.name,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: periodEnd.toISOString(),
    videos_limit: planConfig.videos_limit === -1 ? 999999 : planConfig.videos_limit,
    videos_used: 0,
    dodo_subscription_id: subscriptionId,
    dodo_customer_id: customerId,
    dodo_checkout_session_id: checkoutSessionId,
    billing_period: 'monthly',
    updated_at: new Date().toISOString()
  }

  console.log('💾 Updating subscription:', subscriptionData)

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, { onConflict: 'user_id' })

  if (error) {
    console.error('❌ Failed to update subscription:', error)
    throw error
  }

  console.log('✅ Subscription updated successfully')
}

async function handleCancelledSubscription(supabase: any, data: any) {
  console.log('🚫 Processing cancelled subscription')

  const userId = data?.metadata?.user_id
  const subscriptionId = data?.subscription_id || data?.id

  if (!userId && !subscriptionId) {
    console.error('❌ No user or subscription identifier found')
    return
  }

  // Update subscription status to cancelled
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .or(`user_id.eq.${userId},dodo_subscription_id.eq.${subscriptionId}`)

  if (error) {
    console.error('❌ Failed to cancel subscription:', error)
    throw error
  }

  console.log('✅ Subscription cancelled successfully')
}

async function handleFailedPayment(supabase: any, data: any) {
  console.log('❌ Processing failed payment')

  const userId = data?.metadata?.user_id
  const subscriptionId = data?.subscription_id

  if (!userId && !subscriptionId) {
    console.error('❌ No user or subscription identifier found')
    return
  }

  // Update subscription status to past_due
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .or(`user_id.eq.${userId},dodo_subscription_id.eq.${subscriptionId}`)

  if (error) {
    console.error('❌ Failed to update payment status:', error)
    throw error
  }

  console.log('✅ Payment failure processed')
}


