import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Note: Verify webhook signatures per Dodo docs when available

export async function POST(req: NextRequest) {
  const secret = process.env.DODO_WEBHOOK_SECRET

  // Read raw body first so we can verify signatures
  const raw = await req.text()
  let event: any = null
  try {
    event = raw ? JSON.parse(raw) : null
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!event) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  // Basic signature verification (v1,<base64>) using HMAC-SHA256 of `${timestamp}.${raw}`
  // If secret not set, skip verification (dev convenience)
  if (secret) {
    const sigHeader = req.headers.get('webhook-signature') || ''
    const ts = req.headers.get('webhook-timestamp') || ''
    const parts = sigHeader.split(',')
    const v1 = parts.length === 2 && parts[0] === 'v1' ? parts[1] : ''
    try {
      const payloadToSign = `${ts}.${raw}`
      const computed = crypto.createHmac('sha256', secret).update(payloadToSign).digest('base64')
      if (!v1 || !crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(computed))) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
    }
  }

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


