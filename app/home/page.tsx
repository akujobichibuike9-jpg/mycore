'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
        <div className="absolute w-[350px] h-[350px] -bottom-16 left-1/4 rounded-full bg-purple-800/30" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-lg font-semibold">MyCore</span>
        </div>
        <Link href="/login">
          <button className="px-4 py-2 text-sm rounded-full bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20">
            Sign in
          </button>
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <div className={`flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-purple-500/10 border border-purple-500/20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-xs text-purple-300 font-medium tracking-wide uppercase">Now in Beta</span>
        </div>

        <h1 className={`text-5xl md:text-7xl font-bold text-center max-w-4xl leading-tight tracking-tight transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="bg-gradient-to-b from-white via-white to-purple-200/80 bg-clip-text text-transparent">Run your day.</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">Effortlessly.</span>
        </h1>

        <p className={`mt-8 text-lg text-purple-200/50 text-center max-w-2xl font-light leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Scheduling, summaries, reminders, and workflows — handled automatically by your core assistant.
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 mt-12 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link href="/signup">
            <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold text-sm flex items-center gap-2">
              Get started free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
        </div>

        <div className={`flex flex-wrap justify-center gap-3 mt-16 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {['Smart scheduling', 'Email summaries', 'Reminders', 'Automation'].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/5 border border-purple-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-sm text-purple-300/60">{feature}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 px-6 py-8 text-center text-xs text-purple-300/30">
        <p>© 2025 MyCore by ChiVera. All rights reserved.</p>
      </footer>
    </div>
  )
}
