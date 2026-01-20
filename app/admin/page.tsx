'use client'

import { useState, useEffect, useCallback } from 'react'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [appEnabled, setAppEnabled] = useState(true)
  const [coreEnabled, setCoreEnabled] = useState(true)
  const [uptime, setUptime] = useState('0h 0m')
  const [logs, setLogs] = useState<any[]>([])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, loginsToday: 0, loginsWeek: 0, loginsMonth: 0 })
  
  const [showModal, setShowModal] = useState<'app' | 'core' | null>(null)
  const [confirmPwd, setConfirmPwd] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const getPassword = () => sessionStorage.getItem('admin_pwd') || ''

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin')
      const data = await res.json()
      
      if (data.settings) {
        setAppEnabled(data.settings.app_enabled ?? true)
        setCoreEnabled(data.settings.core_enabled ?? true)
        
        if (data.settings.uptime_start) {
          const diff = Date.now() - new Date(data.settings.uptime_start).getTime()
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          setUptime(`${h}h ${m}m`)
        }
      }
      
      if (data.logs) setLogs(data.logs)
      if (data.blockedUsers) setBlockedUsers(data.blockedUsers)
      if (data.stats) setStats(data.stats)
    } catch (e) {
      console.error('Fetch error:', e)
    }
  }, [])

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

  const handleToggle = async () => {
    if (!showModal || confirmPwd !== getPassword()) {
      setError('Password mismatch')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          type: showModal,
          password: getPassword()
        })
      })

      if (res.ok) {
        await fetchData()
        setShowModal(null)
        setConfirmPwd('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed')
      }
    } catch {
      setError('Connection error')
    }
    setActionLoading(false)
  }

  const handleBlock = async (userId: string, block: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: block ? 'block' : 'unblock',
          userId,
          password: getPassword()
        })
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (e) {
      console.error('Block error:', e)
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pwd')
    if (saved) {
      setPassword(saved)
      setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchData()
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [authenticated, fetchData])

  const isBlocked = (userId: string) => blockedUsers.includes(userId)

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
              placeholder="Admin password"
              className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold disabled:opacity-50"
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={() => { sessionStorage.removeItem('admin_pwd'); setAuthenticated(false) }}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400"
          >
            Logout
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400">{error}</div>}

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
            <p className="text-sm text-purple-300/50">This Week</p>
            <p className="text-3xl font-bold">{stats.loginsWeek}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-sm text-purple-300/50">Uptime</p>
            <p className="text-3xl font-bold">{uptime}</p>
          </div>
        </div>

        {/* Kill Switches */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">App Kill Switch</h3>
              <p className="text-sm text-purple-300/50">Disable entire app</p>
            </div>
            <button
              onClick={() => setShowModal('app')}
              className={`px-5 py-2 rounded-lg font-semibold ${appEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {appEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Core AI Switch</h3>
              <p className="text-sm text-purple-300/50">Disable AI only</p>
            </div>
            <button
              onClick={() => setShowModal('core')}
              className={`px-5 py-2 rounded-lg font-semibold ${coreEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {coreEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="p-6 rounded-xl bg-purple-950/30 border border-purple-500/10">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Logins</h3>
            <button onClick={fetchData} className="text-purple-400 text-sm">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-purple-300/50 border-b border-purple-500/10">
                  <th className="text-left pb-3">Email</th>
                  <th className="text-left pb-3">IP</th>
                  <th className="text-left pb-3">Device</th>
                  <th className="text-left pb-3">Time</th>
                  <th className="text-left pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-purple-300/40">No logs yet</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="border-b border-purple-500/5">
                    <td className="py-3">{log.email}</td>
                    <td className="py-3 text-purple-300/60">{log.ip_address || '-'}</td>
                    <td className="py-3 text-purple-300/60">{log.device_type || '-'}</td>
                    <td className="py-3 text-purple-300/60">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleBlock(log.user_id, !isBlocked(log.user_id))}
                        className={`px-3 py-1 rounded text-xs font-medium ${isBlocked(log.user_id) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                      >
                        {isBlocked(log.user_id) ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-950 p-6 rounded-xl max-w-md w-full border border-purple-500/30">
            <h3 className="text-xl font-bold mb-2">Confirm Action</h3>
            <p className="text-purple-300/70 mb-4">
              {showModal === 'app' 
                ? (appEnabled ? 'Disable the entire app?' : 'Enable the entire app?')
                : (coreEnabled ? 'Disable Core AI?' : 'Enable Core AI?')
              }
            </p>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Re-enter admin password"
              className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(null); setConfirmPwd(''); setError('') }}
                className="flex-1 py-3 rounded-lg bg-purple-500/20 text-purple-300"
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                disabled={actionLoading || !confirmPwd}
                className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
