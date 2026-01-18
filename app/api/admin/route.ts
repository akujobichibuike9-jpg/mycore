import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: settings } = await supabase.from('app_settings').select('*').single()
    const { data: logs } = await supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(50)

    return NextResponse.json({
      settings: settings || { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() },
      logs: logs || [],
      stats: { totalUsers: 0, loginsToday: 0, loginsWeek: 0, loginsMonth: 0 }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, password, type, userId } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (action === 'login') {
      if (password === adminPassword) return NextResponse.json({ success: true })
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    if (action === 'toggle') {
      if (password !== adminPassword) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      
      const { data: current } = await supabase.from('app_settings').select('*').single()
      const field = type === 'app' ? 'app_enabled' : 'core_enabled'
      const newValue = !(current?.[field] ?? true)
      
      await supabase.from('app_settings').upsert({ id: 1, [field]: newValue })
      return NextResponse.json({ success: true })
    }

    if (action === 'block') {
      await supabase.from('blocked_users').upsert({ user_id: userId, blocked: true })
      return NextResponse.json({ success: true })
    }

    if (action === 'unblock') {
      await supabase.from('blocked_users').delete().eq('user_id', userId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}