'use client'

import { useState, useEffect } from 'react'

interface LoginLog {
  id: string
  email: string
  ip_address: string
  device_type: string
  created_at: string
  user_id: string
}

interface AppSettings {
  app_enabled: boolean
  core_enabled: boolean
  uptime_start: string
}

interface Stats {
  totalUsers: number
  loginsToday: number
  loginsWeek: number
  loginsMonth: number
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [settings, setSettings] = useState<AppSettings>({
    app_enabled: true,
    core_enabled: true,
    uptime_start: new Date().toISOString()
  })
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    loginsToday: 0,
    loginsWeek: 0,
    loginsMonth: 0
  })
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [showConfirm, setShowConfirm] = useState<{type: 'app' | 'core', currentState: boolean} | null>(null)
  const [confirmPassword, setConfirmPassword] = useState('')

  const getStoredPassword = () => sessionStorage.getItem('admin_pwd') || ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password })
      })

      if (res.ok) {
        sessionStorage.setItem('admin_pwd', password)
        setAuthenticated(true)
        fetchData()
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Connection error')
    }
    setLoading(false)
  }

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) setSettings(data.settings)
        if (data.logs) setLogs(data.logs)
        if (data.stats) setStats(data.stats)
        if (data.blockedUsers) setBlockedUsers(data.blockedUsers)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pwd')
    if (saved) {
      setPassword(saved)
      setAuthenticated(true)
      fetchData()
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  const handleToggle = async () => {
    if (!showConfirm) return
    
    const pwd = getStoredPassword()
    if (confirmPassword !== pwd) {
      setError('Password does not match')
      return
    }

    setActionLoading(showConfirm.type)
    setError('')

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle', 
          type: showConfirm.type,
          password: pwd
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        await fetchData()
        setShowConfirm(null)
        setConfirmPassword('')
      } else {
        setError(data.error || 'Failed to toggle')
      }
    } catch {
      setError('Connection error')
    }
    setActionLoading(null)
  }

  const handleBlock = async (userId: string, shouldBlock: boolean) => {
    setActionLoading(userId)

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: shouldBlock ? 'block' : 'unblock', 
          userId,
          password: getStoredPassword()
        })
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Block error:', err)
    }
    setActionLoading(null)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_pwd')
    setAuthenticated(false)
    setPassword('')
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString()

  const getUptime = () => {
    if (!settings?.uptime_start) return '0h 0m'
    const diff = Date.now() - new Date(settings.uptime_start).getTime()
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`
  }

  const isBlocked = (userId: string) => blockedUsers.includes(userId)

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/30 border border-purple-500/20">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white mb-4"
            />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold disabled:opacity-50">
              {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
            Logout
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/50">Total Users</p>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/50">Logins Today</p>
            <p className="text-3xl font-bold">{stats.loginsToday}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/50">Logins This Week</p>
            <p className="text-3xl font-bold">{stats.loginsWeek}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/50">Uptime</p>
            <p className="text-3xl font-bold">{getUptime()}</p>
          </div>
        </div>

        {/* Kill Switches */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">App Kill Switch</h3>
                <p className="text-sm text-purple-300/50">Disable entire application</p>
              </div>
              <button
                onClick={() => setShowConfirm({ type: 'app', currentState: settings.app_enabled })}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  settings.app_enabled 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {settings.app_enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Core AI Kill Switch</h3>
                <p className="text-sm text-purple-300/50">Disable AI assistant only</p>
              </div>
              <button
                onClick={() => setShowConfirm({ type: 'core', currentState: settings.core_enabled })}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  settings.core_enabled 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {settings.core_enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Logins */}
        <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent Logins</h3>
            <button onClick={fetchData} className="text-sm text-purple-400 hover:text-purple-300">Refresh</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-purple-300/50 border-b border-purple-500/10">
                  <th className="pb-3">Email</th>
                  <th className="pb-3">IP</th>
                  <th className="pb-3">Device</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-purple-300/40">No login logs</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-purple-500/5">
                      <td className="py-3">{log.email}</td>
                      <td className="py-3 text-purple-300/60">{log.ip_address || '-'}</td>
                      <td className="py-3 text-purple-300/60">{log.device_type || '-'}</td>
                      <td className="py-3 text-purple-300/60">{formatDate(log.created_at)}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleBlock(log.user_id, !isBlocked(log.user_id))}
                          disabled={actionLoading === log.user_id}
                          className={`px-3 py-1 rounded text-xs font-medium disabled:opacity-50 ${
                            isBlocked(log.user_id)
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {actionLoading === log.user_id ? '...' : isBlocked(log.user_id) ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-950 p-6 rounded-xl max-w-md w-full border border-purple-500/30">
            <h3 className="text-xl font-bold mb-2">Confirm Action</h3>
            <p className="text-purple-300/70 mb-4">
              {showConfirm.currentState 
                ? `Are you sure you want to DISABLE ${showConfirm.type === 'app' ? 'the entire app' : 'Core AI'}?`
                : `Are you sure you want to ENABLE ${showConfirm.type === 'app' ? 'the entire app' : 'Core AI'}?`
              }
            </p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter admin password"
              className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(null); setConfirmPassword(''); setError(''); }}
                className="flex-1 py-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                disabled={actionLoading !== null || !confirmPassword}
                className={`flex-1 py-3 rounded-lg font-medium disabled:opacity-50 ${
                  showConfirm.currentState 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {actionLoading ? 'Processing...' : showConfirm.currentState ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
