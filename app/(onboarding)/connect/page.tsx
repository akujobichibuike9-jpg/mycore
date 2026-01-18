'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConnectContent() {
  const searchParams = useSearchParams()
  const [googleConnected, setGoogleConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if redirected from Google OAuth
    const connected = searchParams.get('connected')
    if (connected === 'google') {
      setGoogleConnected(true)
    }

    // Check if already connected
    async function checkConnection() {
      try {
        const res = await fetch('/api/calendar')
        setGoogleConnected(res.ok)
      } catch {
        setGoogleConnected(false)
      }
      setLoading(false)
    }
    checkConnection()
  }, [searchParams])

  const handleGoogleConnect = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <section className="relative z-10 px-6">
      <div className="space-y-4">
        {/* Google */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-purple-300/40">Calendar & Gmail</p>
              </div>
            </div>
            {loading ? (
              <span className="text-sm text-purple-300/40">Checking...</span>
            ) : googleConnected ? (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">Connected</span>
            ) : (
              <button
                onClick={handleGoogleConnect}
                className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-colors"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* More integrations coming soon */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/5 opacity-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <p className="font-medium">More integrations</p>
              <p className="text-sm text-purple-300/40">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <Link href="/assistant" className="block mt-8">
        <button className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold">
          {googleConnected ? 'Continue' : 'Skip for now'}
        </button>
      </Link>
    </section>
  )
}

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-8">
        <Link href="/home" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-xl font-semibold">MyCore</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Connect your accounts</h1>
        <p className="text-purple-200/40">Let MyCore help manage your calendar and emails</p>
      </header>

      <Suspense fallback={
        <section className="relative z-10 px-6">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center">
            Loading...
          </div>
        </section>
      }>
        <ConnectContent />
      </Suspense>
    </div>
  )
}
