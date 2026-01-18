'use client'

import { useState, useEffect } from 'react'

interface LoginLog {
  id: string
  email: string
  ip_address: string
  user_agent: string
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
  const [confirmModal, setConfirmModal] = useState<{type: string, action: string} | null>(null)
  const [confirmPassword, setConfirmPassword] = useState('')

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
        setAuthenticated(true)
        sessionStorage.setItem('admin_auth', password)
        fetchData()
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('Connection error')
    }
    setLoading(false)
  }

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin', {
        headers: {
          'x-admin-password': sessionStorage.getItem('admin_auth') || ''
        }
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || settings)
        setLogs(data.logs || [])
        setStats(data.stats || stats)
        setBlockedUsers(data.blockedUsers || [])
      }
    } catch (err) {
      console.error('Failed to fetch data')
    }
  }

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth')
    if (savedAuth) {
      setPassword(savedAuth)
      setAuthenticated(true)
      fetchData()
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(fetchData, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [authenticated])

  const handleToggle = async (type: 'app' | 'core') => {
    if (confirmPassword !== sessionStorage.getItem('admin_auth')) {
      setError('Invalid password')
      return
    }
    
    setActionLoading(type)
    setError('')
    
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle', 
          type,
          password: confirmPassword
        })
      })

      if (res.ok) {
        await fetchData()
        setConfirmModal(null)
        setConfirmPassword('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to toggle')
      }
    } catch (err) {
      setError('Connection error')
    }
    setActionLoading(null)
  }

  const handleBlockUser = async (userId: string, block: boolean) => {
    setActionLoading(userId)
    
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: block ? 'block' : 'unblock', 
          userId,
          password: sessionStorage.getItem('admin_auth')
        })
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to block/unblock user')
    }
    setActionLoading(null)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setAuthenticated(false)
    setPassword('')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getUptime = () => {
    if (!settings?.uptime_start) return '0h 0m'
    const start = new Date(settings.uptime_start).getTime()
    const now = Date.now()
    const diff = now - start
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h ${minutes}m`
  }

  const isUserBlocked = (userId: string) => blockedUsers.includes(userId)

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/20" />
          <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/10" />
        </div>
        
        <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/30 border border-purple-500/10 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-purple-300/40">MyCore Control Center</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500/50"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access Panel'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/20" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/10" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MyCore Admin</h1>
              <p className="text-sm text-purple-300/40">Control Center</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40 mb-1">Total Users</p>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40 mb-1">Logins Today</p>
            <p className="text-3xl font-bold">{stats.loginsToday}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40 mb-1">This Week</p>
            <p className="text-3xl font-bold">{stats.loginsWeek}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40 mb-1">Uptime</p>
            <p className="text-3xl font-bold">{getUptime()}</p>
          </div>
        </div>

        {/* Kill Switches */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.app_enabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <svg className={`w-6 h-6 ${settings.app_enabled ? 'text-green-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">App Kill Switch</h3>
                  <p className="text-sm text-purple-300/40">Disable entire application</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModal({ type: 'app', action: settings.app_enabled ? 'disable' : 'enable' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  settings.app_enabled 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {settings.app_enabled ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.core_enabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <svg className={`w-6 h-6 ${settings.core_enabled ? 'text-green-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Core AI Switch</h3>
                  <p className="text-sm text-purple-300/40">Disable AI assistant only</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModal({ type: 'core', action: settings.core_enabled ? 'disable' : 'enable' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  settings.core_enabled 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {settings.core_enabled ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>
          </div>
        </div>

        {/* Login Logs */}
        <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Logins</h3>
            <button onClick={fetchData} className="text-sm text-purple-400 hover:text-purple-300">
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-purple-300/40 border-b border-purple-500/10">
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">IP Address</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-purple-300/40">
                      No login logs yet
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-purple-500/5">
                      <td className="py-3 pr-4">{log.email}</td>
                      <td className="py-3 pr-4 text-purple-300/60">{log.ip_address || 'Unknown'}</td>
                      <td className="py-3 pr-4 text-purple-300/60">{formatDate(log.created_at)}</td>
                      <td className="py-3 pr-4">
                        {isUserBlocked(log.user_id) ? (
                          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">Blocked</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">Active</span>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleBlockUser(log.user_id, !isUserBlocked(log.user_id))}
                          disabled={actionLoading === log.user_id}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                            isUserBlocked(log.user_id)
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {actionLoading === log.user_id ? '...' : isUserBlocked(log.user_id) ? 'Unblock' : 'Block'}
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-950 p-6 rounded-xl max-w-md w-full border border-purple-500/20">
            <h3 className="text-xl font-bold mb-2">Confirm Action</h3>
            <p className="text-purple-300/60 mb-4">
              Are you sure you want to {confirmModal.action} {confirmModal.type === 'app' ? 'the entire app' : 'Core AI'}?
              {confirmModal.action === 'disable' && ' Users will not be able to access the service.'}
            </p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter admin password to confirm"
              className="w-full bg-black/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500/50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmModal(null); setConfirmPassword(''); setError(''); }}
                className="flex-1 py-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggle(confirmModal.type as 'app' | 'core')}
                disabled={actionLoading !== null}
                className={`flex-1 py-3 rounded-lg font-medium disabled:opacity-50 ${
                  confirmModal.action === 'disable' 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {actionLoading ? 'Processing...' : confirmModal.action === 'disable' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
