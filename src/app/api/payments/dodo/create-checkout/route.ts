import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DODO_API_BASE = process.env.DODO_API_BASE || 'https://api.dodopayments.com'
const DODO_API_KEY = process.env.DODO_API_KEY
const DODO_BRAND_ID = process.env.DODO_BRAND_ID

export async function POST(req: NextRequest) {
  try {
    console.log('Dodo checkout API called')

    if (!DODO_API_KEY) {
      console.error('Missing DODO_API_KEY')
      return NextResponse.json({ error: 'Missing DODO_API_KEY' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch((e) => {
      console.error('JSON parse error:', e)
      return {}
    }) as { planId?: string; metadata?: Record<string, string> }

    console.log('Request body:', body)

    const planId = body.planId
    if (!planId) {
      console.error('Missing planId in request')
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    // Dodo Checkout Sessions uses return_url per docs
    const returnUrl = `${siteUrl}/dashboard?upgraded=true`

    // Create Checkout Session per docs: product_cart + return_url
    const payload: any = {
      product_cart: [
        { product_id: planId, quantity: 1 }
      ],
      return_url: returnUrl,
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

    console.log('Sending payload to Dodo:', payload)
    console.log('Dodo API URL:', `${DODO_API_BASE}/checkouts`)

    const resp = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DODO_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    console.log('Dodo API response status:', resp.status)

    const data = await resp.json().catch((e) => {
      console.error('Failed to parse Dodo response as JSON:', e)
      return {}
    })

    console.log('Dodo API response data:', data)

    if (!resp.ok) {
      console.error('Dodo API error:', data)
      return NextResponse.json({
        error: data?.message || 'Failed to create checkout',
        details: data || null,
        status: resp.status
      }, { status: resp.status })
    }

    // Expecting checkout_url per docs
    const checkoutUrl = data?.checkout_url || data?.url || data?.redirect_url
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Checkout URL missing in response' }, { status: 502 })
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (e: any) {
    console.error('Checkout API error:', e)
    console.error('Error stack:', e?.stack)
    return NextResponse.json({
      error: e?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? e?.stack : undefined
    }, { status: 500 })
  }
}


