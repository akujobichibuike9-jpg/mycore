'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LoginLog {
  id: string
  user_id: string
  email: string
  ip_address: string
  device_type: string
  isp: string
  created_at: string
}

interface AdminData {
  appEnabled: boolean
  coreEnabled: boolean
  uptimeStart: string
  totalUsers: number
  stats: {
    today: number
    week: number
    month: number
  }
  loginLogs: LoginLog[]
}

export default function AdminPanel() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AdminData | null>(null)
  const [killPassword, setKillPassword] = useState('')
  const [showKillModal, setShowKillModal] = useState<'app' | 'core' | null>(null)
  const [error, setError] = useState('')

  const fetchData = async (pwd: string) => {
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${pwd}` }
      })
      if (res.ok) {
        const adminData = await res.json()
        setData(adminData)
        setAuthenticated(true)
        localStorage.setItem('admin_pwd', pwd)
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Failed to connect')
    }
  }

  useEffect(() => {
    const savedPwd = localStorage.getItem('admin_pwd')
    if (savedPwd) {
      fetchData(savedPwd)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await fetchData(password)
    setLoading(false)
  }

  const handleKillSwitch = async (type: 'app' | 'core') => {
    const pwd = localStorage.getItem('admin_pwd')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pwd}` 
      },
      body: JSON.stringify({ 
        action: type === 'app' ? 'toggle_app' : 'toggle_core',
        password: killPassword 
      })
    })
    
    if (res.ok) {
      const result = await res.json()
      setData(prev => prev ? { 
        ...prev, 
        appEnabled: result.appEnabled ?? prev.appEnabled,
        coreEnabled: result.coreEnabled ?? prev.coreEnabled,
        uptimeStart: type === 'app' && result.appEnabled ? new Date().toISOString() : prev.uptimeStart
      } : null)
      setShowKillModal(null)
      setKillPassword('')
    } else {
      setError('Invalid password')
    }
  }

  const handleBlockUser = async (userId: string, block: boolean) => {
    const pwd = localStorage.getItem('admin_pwd')
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pwd}` 
      },
      body: JSON.stringify({ action: block ? 'block_user' : 'unblock_user', userId })
    })
    fetchData(pwd!)
  }

  const formatUptime = (start: string) => {
    const diff = Date.now() - new Date(start).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${days}d ${hours}h ${minutes}m`
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_pwd')
    setAuthenticated(false)
    setData(null)
    setPassword('')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
          <p className="text-purple-200/40 mb-6">Enter password to continue</p>
          
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500/50"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Kill Switch Modal */}
      {showKillModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-md p-6 rounded-2xl bg-purple-950/50 border border-purple-500/20">
            <h2 className="text-xl font-bold mb-2 text-red-400">
              {showKillModal === 'app' ? 'Kill App' : 'Kill Core AI'}
            </h2>
            <p className="text-purple-200/40 mb-4">Enter password to confirm</p>
            <input
              type="password"
              placeholder="Password"
              value={killPassword}
              onChange={(e) => setKillPassword(e.target.value)}
              className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowKillModal(null); setKillPassword('') }}
                className="flex-1 py-3 rounded-full bg-purple-500/20 border border-purple-500/20"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleKillSwitch(showKillModal)}
                className="flex-1 py-3 rounded-full bg-red-500 font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-purple-200/40 text-sm">MyCore Control Center</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-purple-500/20 text-sm">
          Logout
        </button>
      </header>

      {/* Kill Switches */}
      <section className="mb-8">
        <h2 className="text-sm text-purple-200/40 mb-3">Kill Switches</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowKillModal('app')}
            className={`p-6 rounded-2xl border text-left ${
              data?.appEnabled 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <p className="font-bold mb-1">App Status</p>
            <p className={`text-sm ${data?.appEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {data?.appEnabled ? '● Online' : '● Offline'}
            </p>
          </button>
          <button
            onClick={() => setShowKillModal('core')}
            className={`p-6 rounded-2xl border text-left ${
              data?.coreEnabled 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <p className="font-bold mb-1">Core AI</p>
            <p className={`text-sm ${data?.coreEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {data?.coreEnabled ? '● Online' : '● Offline'}
            </p>
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8">
        <h2 className="text-sm text-purple-200/40 mb-3">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-2xl font-bold">{data?.totalUsers || 0}</p>
            <p className="text-xs text-purple-300/40">Total Users</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-2xl font-bold">{data?.stats.today || 0}</p>
            <p className="text-xs text-purple-300/40">Today</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-2xl font-bold">{data?.stats.week || 0}</p>
            <p className="text-xs text-purple-300/40">This Week</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
            <p className="text-2xl font-bold">{data?.stats.month || 0}</p>
            <p className="text-xs text-purple-300/40">This Month</p>
          </div>
        </div>
      </section>

      {/* Uptime */}
      <section className="mb-8">
        <h2 className="text-sm text-purple-200/40 mb-3">Uptime</h2>
        <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <p className="text-3xl font-bold text-green-400">
            {data?.uptimeStart ? formatUptime(data.uptimeStart) : '0d 0h 0m'}
          </p>
          <p className="text-xs text-purple-300/40 mt-1">Since last restart</p>
        </div>
      </section>

      {/* Login Logs */}
      <section>
        <h2 className="text-sm text-purple-200/40 mb-3">Login Logs</h2>
        <div className="rounded-2xl bg-purple-950/30 border border-purple-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-500/10">
                <tr>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">IP Address</th>
                  <th className="text-left p-4 font-medium">Device</th>
                  <th className="text-left p-4 font-medium">ISP</th>
                  <th className="text-left p-4 font-medium">Time</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.loginLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-purple-300/40">No login logs yet</td>
                  </tr>
                ) : (
                  data?.loginLogs.map((log) => (
                    <tr key={log.id} className="border-t border-purple-500/10">
                      <td className="p-4">{log.email}</td>
                      <td className="p-4 text-purple-300/60">{log.ip_address}</td>
                      <td className="p-4 text-purple-300/60">{log.device_type}</td>
                      <td className="p-4 text-purple-300/60">{log.isp}</td>
                      <td className="p-4 text-purple-300/60">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleBlockUser(log.user_id, true)}
                          className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-xs"
                        >
                          Block
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
