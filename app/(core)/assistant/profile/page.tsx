'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [googleConnected, setGoogleConnected] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      const res = await fetch('/api/calendar')
      setGoogleConnected(res.ok)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl font-bold">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.user_metadata?.full_name || 'User'}</h1>
            <p className="text-purple-200/40 text-sm">{user?.email || ''}</p>
          </div>
        </div>
      </header>

      {/* Connected Accounts */}
      <section className="relative z-10 px-6 mb-6">
        <h2 className="text-sm text-purple-200/40 mb-3">Connected accounts</h2>
        <div className="space-y-2">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-purple-300/40">Calendar & Gmail</p>
              </div>
            </div>
            {googleConnected ? (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Connected</span>
            ) : (
              <button 
                onClick={handleConnectGoogle}
                className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="relative z-10 px-6 mb-6">
        <h2 className="text-sm text-purple-200/40 mb-3">Settings</h2>
        <div className="space-y-2">
          <Link href="/connect">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center justify-between hover:bg-purple-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔗</span>
                <span className="text-sm font-medium">Manage connections</span>
              </div>
              <svg className="w-4 h-4 text-purple-300/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          <Link href="/settings/notifications">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center justify-between hover:bg-purple-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <svg className="w-4 h-4 text-purple-300/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          <Link href="/settings/appearance">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center justify-between hover:bg-purple-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎨</span>
                <span className="text-sm font-medium">Appearance</span>
              </div>
              <svg className="w-4 h-4 text-purple-300/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Support */}
      <section className="relative z-10 px-6 mb-6">
        <h2 className="text-sm text-purple-200/40 mb-3">Support</h2>
        <div className="space-y-2">
          <a href="mailto:support@mycore.app" className="block p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center justify-between hover:bg-purple-900/30 transition-colors">
            <span className="text-sm font-medium">Send feedback</span>
            <svg className="w-4 h-4 text-purple-300/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </section>

      {/* Sign Out */}
      <section className="relative z-10 px-6">
        <button
          onClick={handleSignOut}
          className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
        >
          Sign out
        </button>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
        <div className="flex items-center justify-around py-3 mx-auto max-w-md rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <Link href="/assistant" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-300/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/assistant/search" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-300/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Search</span>
          </Link>
          <Link href="/assistant/core" className="flex flex-col items-center">
            <div className="w-14 h-14 -mt-8 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
              <div className="w-5 h-5 rounded-full bg-white" />
            </div>
          </Link>
          <Link href="/assistant/history" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-300/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">History</span>
          </Link>
          <Link href="/assistant/profile" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
