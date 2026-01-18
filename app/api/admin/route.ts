import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get app settings
    let { data: settings, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single()

    // If no settings exist, create default
    if (settingsError || !settings) {
      const { data: newSettings } = await supabaseAdmin
        .from('app_settings')
        .upsert({ 
          id: 1, 
          app_enabled: true, 
          core_enabled: true,
          uptime_start: new Date().toISOString()
        })
        .select()
        .single()
      settings = newSettings
    }

    // Get login logs
    const { data: logs } = await supabaseAdmin
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    // Get blocked users
    const { data: blocked } = await supabaseAdmin
      .from('blocked_users')
      .select('user_id')
      .eq('blocked', true)

    const blockedUsers = blocked?.map(b => b.user_id) || []

    // Calculate stats
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get unique users count
    const { data: uniqueUsers } = await supabaseAdmin
      .from('login_logs')
      .select('user_id')
    
    const uniqueUserIds = new Set(uniqueUsers?.map(u => u.user_id) || [])

    // Get login counts
    const { count: loginsToday } = await supabaseAdmin
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)

    const { count: loginsWeek } = await supabaseAdmin
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart)

    const { count: loginsMonth } = await supabaseAdmin
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart)

    return NextResponse.json({
      settings: settings || { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() },
      logs: logs || [],
      blockedUsers,
      stats: {
        totalUsers: uniqueUserIds.size,
        loginsToday: loginsToday || 0,
        loginsWeek: loginsWeek || 0,
        loginsMonth: loginsMonth || 0
      }
    })
  } catch (error: any) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ 
      settings: { app_enabled: true, core_enabled: true, uptime_start: new Date().toISOString() },
      logs: [],
      blockedUsers: [],
      stats: { totalUsers: 0, loginsToday: 0, loginsWeek: 0, loginsMonth: 0 },
      error: error.message 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, password, type, userId } = body

    const adminPassword = process.env.ADMIN_PASSWORD

    // Login action
    if (action === 'login') {
      if (password === adminPassword) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // All other actions require valid password
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Toggle kill switch
    if (action === 'toggle') {
      // Get current settings
      const { data: current } = await supabaseAdmin
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single()

      const currentValue = type === 'app' 
        ? (current?.app_enabled ?? true)
        : (current?.core_enabled ?? true)
      
      const newValue = !currentValue

      const updateData: any = {
        id: 1,
        [type === 'app' ? 'app_enabled' : 'core_enabled']: newValue
      }

      // Reset uptime when app is re-enabled
      if (type === 'app' && newValue === true) {
        updateData.uptime_start = new Date().toISOString()
      }

      const { error } = await supabaseAdmin
        .from('app_settings')
        .upsert(updateData)

      if (error) {
        console.error('Toggle error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, newValue })
    }

    // Block user
    if (action === 'block') {
      const { error } = await supabaseAdmin
        .from('blocked_users')
        .upsert({ 
          user_id: userId, 
          blocked: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Block error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // Unblock user
    if (action === 'unblock') {
      const { error } = await supabaseAdmin
        .from('blocked_users')
        .update({ blocked: false })
        .eq('user_id', userId)

      if (error) {
        // If update fails, try delete
        await supabaseAdmin
          .from('blocked_users')
          .delete()
          .eq('user_id', userId)
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Admin POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
