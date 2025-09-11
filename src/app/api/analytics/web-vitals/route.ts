import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const vitals = await request.json()
    
    // Log web vitals for debugging (remove in production)
    console.log('Web Vitals:', vitals)
    
    // Here you could send to analytics service like:
    // - Google Analytics
    // - Vercel Analytics
    // - Custom analytics endpoint
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Web vitals error:', error)
    return NextResponse.json({ error: 'Failed to track vitals' }, { status: 500 })
  }
}

// Disable for other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}