import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DODO_API_BASE = process.env.DODO_API_BASE || 'https://api.dodopayments.com'
const DODO_API_KEY = process.env.DODO_API_KEY
const DODO_BRAND_ID = process.env.DODO_BRAND_ID

export async function POST(req: NextRequest) {
  try {
    if (!DODO_API_KEY) {
      return NextResponse.json({ error: 'Missing DODO_API_KEY' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({})) as { planId?: string; metadata?: Record<string, string> }
    const planId = body.planId
    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = `${siteUrl}/dashboard?upgraded=true`
    const cancelUrl = `${siteUrl}/dashboard`

    // Create unified checkout session (subscription)
    const payload: any = {
      mode: 'subscription',
      product_id: planId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(DODO_BRAND_ID ? { brand_id: DODO_BRAND_ID } : {}),
      customer: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || undefined,
      },
      metadata: {
        user_id: user.id,
        ...(body.metadata || {})
      }
    }

    const resp = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DODO_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json({
        error: data?.message || 'Failed to create checkout',
        details: data || null,
        status: resp.status
      }, { status: resp.status })
    }

    // Expecting a url field for redirect
    const checkoutUrl = data?.url || data?.checkout_url || data?.redirect_url
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Checkout URL missing in response' }, { status: 502 })
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


