'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    loginsToday: 0,
    loginsWeek: 0,
    loginsMonth: 0
  })
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [actionPassword, setActionPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password })
    })

    if (res.ok) {
      setAuthenticated(true)
      localStorage.setItem('admin_auth', 'true')
      fetchData()
    } else {
      setError('Invalid password')
    }
    setLoading(false)
  }

  const fetchData = async () => {
    const res = await fetch('/api/admin')
    if (res.ok) {
      const data = await res.json()
      setSettings(data.settings)
      setLogs(data.logs || [])
      setStats(data.stats || stats)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true)
      fetchData()
    }
  }, [])

  const handleKillSwitch = async (type: 'app' | 'core') => {
    if (actionPassword !== process.env.NEXT_PUBLIC_ADMIN_CHECK) {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle',
          type,
          password: actionPassword
        })
      })

      if (res.ok) {
        fetchData()
        setConfirmAction(null)
        setActionPassword('')
      } else {
        setError('Invalid password')
      }
    }
  }

  const handleBlockUser = async (userId: string, currentlyBlocked: boolean) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: currentlyBlocked ? 'unblock' : 'block',
        userId
      })
    })

    if (res.ok) {
      fetchData()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setAuthenticated(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getUptime = () => {
    if (!settings?.uptime_start) return '0h 0m'
    const start = new Date(settings.uptime_start).getTime()
    const now = Date.now()
    const diff = now - start
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold"
            >
              {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400">
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40">Logins Today</p>
            <p className="text-2xl font-bold">{stats.loginsToday}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40">Logins This Week</p>
            <p className="text-2xl font-bold">{stats.loginsWeek}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/40">Uptime</p>
            <p className="text-2xl font-bold">{getUptime()}</p>
          </div>
        </div>

        {/* Kill Switches */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">App Kill Switch</h3>
                <p className="text-sm text-purple-300/40">Disable entire application</p>
              </div>
              <button
                onClick={() => setConfirmAction('app')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  settings?.app_enabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {settings?.app_enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Core AI Kill Switch</h3>
                <p className="text-sm text-purple-300/40">Disable AI assistant only</p>
              </div>
              <button
                onClick={() => setConfirmAction('core')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  settings?.core_enabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {settings?.core_enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Confirm Modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-purple-950 p-6 rounded-xl max-w-md w-full border border-purple-500/20">
              <h3 className="text-xl font-bold mb-4">Confirm Action</h3>
              <p className="text-purple-300/60 mb-4">
                Enter admin password to {settings?.[`${confirmAction}_enabled` as keyof AppSettings] ? 'disable' : 'enable'} {confirmAction === 'app' ? 'the entire app' : 'Core AI'}
              </p>
              <input
                type="password"
                value={actionPassword}
                onChange={(e) => setActionPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full bg-black/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmAction(null); setActionPassword(''); }}
                  className="flex-1 py-3 rounded-lg bg-purple-500/20 text-purple-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleKillSwitch(confirmAction as 'app' | 'core')}
                  className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Logs */}
        <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
          <h3 className="font-semibold mb-4">Recent Logins</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-purple-300/40 border-b border-purple-500/10">
                  <th className="pb-3">Email</th>
                  <th className="pb-3">IP</th>
                  <th className="pb-3">Device</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-purple-500/5">
                    <td className="py-3">{log.email}</td>
                    <td className="py-3 text-purple-300/60">{log.ip_address || 'Unknown'}</td>
                    <td className="py-3 text-purple-300/60">{log.device_type || 'Unknown'}</td>
                    <td className="py-3 text-purple-300/60">{formatDate(log.created_at)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleBlockUser(log.user_id, false)}
                        className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30"
                      >
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-purple-300/40">No login logs yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
