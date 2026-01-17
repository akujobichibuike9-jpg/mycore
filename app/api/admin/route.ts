import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mycore-admin-2025'

// Check admin auth
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return false
  }
  return true
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  
  // Get app status
  const { data: appStatus } = await supabase
    .from('app_settings')
    .select('*')
    .single()

  // Get user stats
  const { count: totalUsers } = await supabase
    .from('auth.users')
    .select('*', { count: 'exact', head: true })

  // Get login logs
  const { data: loginLogs } = await supabase
    .from('login_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Calculate stats
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const logsToday = loginLogs?.filter(l => new Date(l.created_at) > dayAgo).length || 0
  const logsWeek = loginLogs?.filter(l => new Date(l.created_at) > weekAgo).length || 0
  const logsMonth = loginLogs?.filter(l => new Date(l.created_at) > monthAgo).length || 0

  return NextResponse.json({
    appEnabled: appStatus?.app_enabled ?? true,
    coreEnabled: appStatus?.core_enabled ?? true,
    uptimeStart: appStatus?.uptime_start || now.toISOString(),
    totalUsers: totalUsers || 0,
    stats: {
      today: logsToday,
      week: logsWeek,
      month: logsMonth,
    },
    loginLogs: loginLogs || [],
  })
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, userId, password } = body

  // Verify password for kill switches
  if ((action === 'toggle_app' || action === 'toggle_core') && password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const supabase = await createClient()

  switch (action) {
    case 'toggle_app': {
      const { data: current } = await supabase.from('app_settings').select('app_enabled').single()
      const newValue = !current?.app_enabled
      await supabase.from('app_settings').upsert({ 
        id: 1, 
        app_enabled: newValue,
        uptime_start: newValue ? new Date().toISOString() : null 
      })
      return NextResponse.json({ success: true, appEnabled: newValue })
    }

    case 'toggle_core': {
      const { data: current } = await supabase.from('app_settings').select('core_enabled').single()
      const newValue = !current?.core_enabled
      await supabase.from('app_settings').upsert({ id: 1, core_enabled: newValue })
      return NextResponse.json({ success: true, coreEnabled: newValue })
    }

    case 'block_user': {
      await supabase.from('blocked_users').upsert({ user_id: userId, blocked: true })
      return NextResponse.json({ success: true })
    }

    case 'unblock_user': {
      await supabase.from('blocked_users').delete().eq('user_id', userId)
      return NextResponse.json({ success: true })
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}
