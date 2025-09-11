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
    const signature = headers().get('whop-signature')
    
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
      case 'membership:created':
      case 'membership:updated':
        await handleMembershipUpsert(supabase, membership)
        break
      
      case 'membership:cancelled':
        await handleMembershipCancellation(supabase, membership)
        break
      
      case 'membership:expired':
        await handleMembershipExpiry(supabase, membership)
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
  const planInfo = PLAN_MAPPING[membership.access_pass.id] || {
    id: membership.access_pass.id,
    name: membership.access_pass.title
  }

  // TODO: Implement proper user mapping from Whop user_id to your auth.users
  // For now, you'll need to add this mapping logic
  // You could store whop_user_id in user profiles or create a mapping table
  
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
    plan_id: planInfo.id,
    status: membership.status === 'past_due' ? 'expired' : membership.status,
    current_period_start: new Date(membership.current_period_start * 1000).toISOString(),
    current_period_end: new Date(membership.current_period_end * 1000).toISOString(),
    videos_limit: videosLimit,
    videos_used: 0 // Reset usage on new period
  }

  if (existingSubscription) {
    // Update existing subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('whop_subscription_id', membership.id)

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`)
    }
  } else {
    // For new subscriptions, you need to map Whop user to your user
    // This is a critical part you'll need to implement based on your user system
    
    // PLACEHOLDER: You need to implement this user mapping
    console.warn('User mapping not implemented! Need to map Whop user_id:', membership.user_id)
    
    // Example approaches:
    // 1. Store whop_user_id in user profiles during signup
    // 2. Create a separate user mapping table  
    // 3. Use email matching if available in webhook
    
    // For now, skip creating new subscriptions until mapping is implemented
    console.log('Skipping new subscription creation - user mapping needed')
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
    .update({ status: 'expired' })
    .eq('whop_subscription_id', membership.id)

  if (error) {
    throw new Error(`Failed to expire subscription: ${error.message}`)
  }
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