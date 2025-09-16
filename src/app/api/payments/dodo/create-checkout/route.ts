import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DODO_API_BASE = process.env.DODO_API_BASE || 'https://test.dodopayments.com'
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
    const returnUrl = `${siteUrl}/dashboard?upgraded=true`

    // Create Checkout Session per Dodo API docs
    const payload: any = {
      product_cart: [
        {
          product_id: planId,
          quantity: 1
        }
      ],
      customer: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      },
      return_url: returnUrl,
      metadata: {
        user_id: user.id,
        ...(body.metadata || {})
      }
    }

    // Add brand_id if available
    if (DODO_BRAND_ID) {
      payload.brand_id = DODO_BRAND_ID
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

    // Extract checkout_url from response per Dodo API docs
    const checkoutUrl = data?.checkout_url
    if (!checkoutUrl) {
      console.error('Missing checkout_url in Dodo response:', data)
      return NextResponse.json({
        error: 'Checkout URL missing in response',
        response_data: data
      }, { status: 502 })
    }

    console.log('✓ Checkout session created successfully:', data.session_id)
    console.log('✓ Checkout URL:', checkoutUrl)

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


