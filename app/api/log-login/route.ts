import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email } = body
    
    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Parse device type from user agent
    let deviceType = 'Desktop'
    if (/mobile/i.test(userAgent)) deviceType = 'Mobile'
    else if (/tablet/i.test(userAgent)) deviceType = 'Tablet'
    
    const supabase = await createClient()
    
    await supabase.from('login_logs').insert({
      user_id: userId,
      email: email,
      ip_address: ip,
      device_type: deviceType,
      isp: 'Unknown', // Would need external API to get ISP
      user_agent: userAgent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login log error:', error)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}
