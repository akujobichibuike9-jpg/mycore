import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing SUPABASE env vars')
    return null
  }
  return createClient(url, key)
}

export async function GET() {
  const supabase = getSupabase()
  
  const defaultResponse = {
    settings: { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() },
    logs: [],
    blockedUsers: [],
    stats: { totalUsers: 0, loginsToday: 0, loginsWeek: 0, loginsMonth: 0 }
  }

  if (!supabase) {
    return NextResponse.json(defaultResponse)
  }

  try {
    // Get settings
    let { data: settings } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (!settings) {
      await supabase.from('app_settings').insert({ id: 1, app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() })
      settings = { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() }
    }

    // Get logs
    const { data: logs } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    // Get blocked users
    const { data: blocked } = await supabase
      .from('blocked_users')
      .select('user_id')
      .eq('blocked', true)

    // Calculate stats
    const { data: allLogs } = await supabase.from('login_logs').select('user_id, created_at')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const uniqueUsers = new Set((allLogs || []).map(l => l.user_id))
    const loginsToday = (allLogs || []).filter(l => new Date(l.created_at) >= today).length
    const loginsWeek = (allLogs || []).filter(l => new Date(l.created_at) >= weekAgo).length

    return NextResponse.json({
      settings,
      logs: logs || [],
      blockedUsers: (blocked || []).map(b => b.user_id),
      stats: {
        totalUsers: uniqueUsers.size,
        loginsToday,
        loginsWeek,
        loginsMonth: (allLogs || []).length
      }
    })
  } catch (err) {
    console.error('Admin GET error:', err)
    return NextResponse.json(defaultResponse)
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { action, password, type, userId } = body
    const adminPwd = process.env.ADMIN_PASSWORD

    // Login check
    if (action === 'login') {
      if (password === adminPwd) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // All other actions need password
    if (password !== adminPwd) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Toggle kill switch
    if (action === 'toggle') {
      const field = type === 'app' ? 'app_enabled' : 'core_enabled'
      
      // Get current
      const { data: current } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single()

      const currentVal = current ? current[field] : true
      const newVal = !currentVal

      // Build update
      const update: any = { id: 1, [field]: newVal }
      if (type === 'app' && newVal === true) {
        update.uptime_start = new Date().toISOString()
      }

      // Upsert
      const { error } = await supabase
        .from('app_settings')
        .upsert(update, { onConflict: 'id' })

      if (error) {
        console.error('Toggle error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, [field]: newVal })
    }

    // Block user
    if (action === 'block' && userId) {
      // Check if exists
      const { data: existing } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        await supabase.from('blocked_users').update({ blocked: true }).eq('user_id', userId)
      } else {
        await supabase.from('blocked_users').insert({ user_id: userId, blocked: true })
      }

      return NextResponse.json({ success: true })
    }

    // Unblock user
    if (action === 'unblock' && userId) {
      await supabase.from('blocked_users').delete().eq('user_id', userId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('Admin POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
