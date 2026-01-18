import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({
      settings: { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() },
      logs: [], blockedUsers: [], stats: { totalUsers: 0, loginsToday: 0, loginsWeek: 0, loginsMonth: 0 }
    })
  }

  try {
    const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single()
    const { data: logs } = await supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(50)
    const { data: blocked } = await supabase.from('blocked_users').select('user_id').eq('blocked', true)
    const { data: allLogs } = await supabase.from('login_logs').select('user_id, created_at')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(Date.now() - 7 * 86400000)
    const uniqueUsers = new Set(allLogs?.map(l => l.user_id) || [])

    return NextResponse.json({
      settings: settings || { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() },
      logs: logs || [],
      blockedUsers: blocked?.map(b => b.user_id) || [],
      stats: {
        totalUsers: uniqueUsers.size,
        loginsToday: allLogs?.filter(l => new Date(l.created_at) >= today).length || 0,
        loginsWeek: allLogs?.filter(l => new Date(l.created_at) >= weekAgo).length || 0,
        loginsMonth: allLogs?.length || 0
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      settings: { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() },
      logs: [], blockedUsers: [], stats: { totalUsers: 0, loginsToday: 0, loginsWeek: 0, loginsMonth: 0 }
    })
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { action, password, type, userId } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (action === 'login') {
      return password === adminPassword 
        ? NextResponse.json({ success: true })
        : NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    if (action === 'toggle' && (type === 'app' || type === 'core')) {
      const field = type === 'app' ? 'app_enabled' : 'core_enabled'
      const { data: current } = await supabase.from('app_settings').select(field).eq('id', 1).single()
      const newValue = !(current?.[field] ?? true)
      const updateData: any = { id: 1, [field]: newValue }
      if (type === 'app' && newValue) updateData.uptime_start = new Date().toISOString()
      await supabase.from('app_settings').upsert(updateData)
      return NextResponse.json({ success: true, [field]: newValue })
    }

    if (action === 'block' && userId) {
      await supabase.from('blocked_users').upsert({ user_id: userId, blocked: true }, { onConflict: 'user_id' })
      return NextResponse.json({ success: true })
    }

    if (action === 'unblock' && userId) {
      await supabase.from('blocked_users').delete().eq('user_id', userId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}