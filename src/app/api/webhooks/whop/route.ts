import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET

interface WhopMembership {
  id: string
  user_id: string
  access_pass: {
    id: string
    title: string
  }
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  cancel_at_period_end: boolean
  current_period_start: number
  current_period_end: number
  trial_start?: number
  trial_end?: number
}

interface WhopWebhookPayload {
  type: string
  data: {
    membership: WhopMembership
  }
}

const PLAN_MAPPING: Record<string, { id: string; name: string }> = {
  'plan_TfXAKUpmBXIMA': { id: 'plan_TfXAKUpmBXIMA', name: 'Basic' },
  'plan_N97PuJswksstF': { id: 'plan_N97PuJswksstF', name: 'Pro' },
  'plan_HeStJKVzCFSSa': { id: 'plan_HeStJKVzCFSSa', name: 'Agency' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('whop-signature')
    
    // Verify webhook signature (implement based on Whop's documentation)
    if (WHOP_WEBHOOK_SECRET && !verifyWebhookSignature(body, signature, WHOP_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: WhopWebhookPayload = JSON.parse(body)
    const { type, data } = payload
    const { membership } = data

    console.log('Whop webhook received:', type, membership.id)

    const supabase = createClient()

    switch (type) {
      case 'payment_succeeded':
      case 'membership_went_valid':
        await handleMembershipUpsert(supabase, membership)
        break
      
      case 'membership_cancel_at_period_end_changed':
        await handleMembershipCancellation(supabase, membership)
        break
      
      case 'membership_went_invalid':
        await handleMembershipExpiry(supabase, membership)
        break
      
      case 'refund_created':
        await handleRefund(supabase, membership)
        break
      
      default:
        console.log('Unhandled webhook type:', type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleMembershipUpsert(supabase: any, membership: WhopMembership) {
  console.log('Processing membership:', membership.id, 'for user:', membership.user_id)
  
  const planInfo = PLAN_MAPPING[membership.access_pass.id] || {
    id: membership.access_pass.id,
    name: membership.access_pass.title
  }

  // Check if subscription already exists
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('whop_subscription_id', membership.id)
    .single()

  // Determine video limits based on plan
  let videosLimit = 999999 // Unlimited for paid plans
  if (planInfo.id === 'plan_TfXAKUpmBXIMA') videosLimit = 1000 // Basic
  if (planInfo.id === 'plan_N97PuJswksstF') videosLimit = 999999 // Pro - unlimited  
  if (planInfo.id === 'plan_HeStJKVzCFSSa') videosLimit = 999999 // Agency - unlimited

  const subscriptionData = {
    whop_subscription_id: membership.id,
    whop_user_id: membership.user_id,
    plan_id: planInfo.id,
    status: membership.status === 'past_due' ? 'expired' : membership.status,
    current_period_start: new Date(membership.current_period_start * 1000).toISOString(),
    current_period_end: new Date(membership.current_period_end * 1000).toISOString(),
    videos_limit: videosLimit,
    videos_used: existingSubscription?.videos_used || 0,
    updated_at: new Date().toISOString()
  }

  if (existingSubscription) {
    // Update existing subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('whop_subscription_id', membership.id)

    if (error) {
      console.error('Failed to update subscription:', error)
      throw new Error(`Failed to update subscription: ${error.message}`)
    }
    console.log('Updated existing subscription:', membership.id)
  } else {
    // For new subscriptions, try to find user by email or create mapping
    let userId = null
    
    try {
      // First, try to find user by whop_user_id if we have a mapping
      const { data: userMapping } = await supabase
        .from('profiles')
        .select('id')
        .eq('whop_user_id', membership.user_id)
        .single()
      
      if (userMapping) {
        userId = userMapping.id
      } else {
        // If no mapping exists, we'll need to create the subscription without a user_id
        // and let the user claim it when they sign in by matching whop_user_id
        console.log('No user mapping found for Whop user:', membership.user_id)
      }
    } catch (error: any) {
      console.log('User mapping lookup failed:', error.message)
    }

    // Create new subscription (with or without user_id)
    const newSubscriptionData = {
      ...subscriptionData,
      user_id: userId, // Will be null if no mapping found
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .insert(newSubscriptionData)

    if (error) {
      console.error('Failed to create subscription:', error)
      throw new Error(`Failed to create subscription: ${error.message}`)
    }
    console.log('Created new subscription:', membership.id, 'for user:', userId || 'unmapped')
  }
}

async function handleMembershipCancellation(supabase: any, membership: WhopMembership) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'cancelled'
    })
    .eq('whop_subscription_id', membership.id)

  if (error) {
    throw new Error(`Failed to cancel subscription: ${error.message}`)
  }
}

async function handleMembershipExpiry(supabase: any, membership: WhopMembership) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('whop_subscription_id', membership.id)

  if (error) {
    console.error('Failed to expire subscription:', error)
    throw new Error(`Failed to expire subscription: ${error.message}`)
  }
  console.log('Expired subscription:', membership.id)
}

async function handleRefund(supabase: any, membership: WhopMembership) {
  // When a refund is created, we should expire the subscription
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'refunded',
      updated_at: new Date().toISOString()
    })
    .eq('whop_subscription_id', membership.id)

  if (error) {
    console.error('Failed to process refund:', error)
    throw new Error(`Failed to process refund: ${error.message}`)
  }
  console.log('Processed refund for subscription:', membership.id)
}

// Placeholder for webhook signature verification
function verifyWebhookSignature(body: string, signature: string | null, secret: string): boolean {
  // Implement based on Whop's webhook signature verification
  // This is a placeholder - check Whop's documentation for the exact implementation
  if (!signature) return false
  
  // Example implementation (adjust based on Whop's actual method):
  // const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')
  // return signature === expectedSignature
  
  return true // Temporarily return true for development
}