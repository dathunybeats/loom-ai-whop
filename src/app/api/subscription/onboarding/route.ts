import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { welcomed?: boolean; onboardingCompleted?: boolean }

    const updates: Record<string, any> = {}
    if (body.welcomed) updates.welcomed_at = new Date().toISOString()
    if (typeof body.onboardingCompleted === 'boolean') updates.onboarding_completed = body.onboardingCompleted

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

