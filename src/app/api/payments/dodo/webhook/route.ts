import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Note: Verify webhook signatures per Dodo docs when available

export async function POST(req: NextRequest) {
  const secret = process.env.DODO_WEBHOOK_SECRET
  // TODO: verify signature header if provided by Dodo

  const event = await req.json().catch(() => null)
  if (!event) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  try {
    const supabase = await createClient()

    // Basic intents (adjust to Dodo events):
    // payment.succeeded, subscription.created, subscription.renewed, subscription.canceled
    const type = event?.type || event?.event
    const data = event?.data || event

    if (type?.startsWith('subscription')) {
      const customerEmail: string | undefined = data?.customer?.email || data?.customer_email
      const userId = data?.metadata?.user_id
      const planId = data?.product_id || data?.plan_id
      const status = data?.status || 'active'
      const currentPeriodEnd = data?.current_period_end || new Date(Date.now() + 30*24*60*60*1000).toISOString()

      if (userId || customerEmail) {
        // Resolve user id by email if needed
        let finalUserId = userId
        if (!finalUserId && customerEmail) {
          const { data: userRow } = await supabase.from('auth.users').select('id').eq('email', customerEmail).maybeSingle()
          finalUserId = userRow?.id
        }

        if (finalUserId) {
          await supabase.from('user_subscriptions').upsert({
            user_id: finalUserId,
            plan_id: planId || 'plan_external',
            status: status === 'canceled' ? 'cancelled' : status,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(currentPeriodEnd).toISOString(),
            videos_limit: 1000000,
            videos_used: 0
          }, { onConflict: 'user_id' })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unhandled' }, { status: 500 })
  }
}


