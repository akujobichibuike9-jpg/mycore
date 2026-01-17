'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const quickActions = [
    { label: 'Schedule meeting', icon: '📅', href: '/schedule' },
    { label: 'Check emails', icon: '✉️', href: '/assistant/core?q=Summarize my unread emails' },
    { label: 'Today\'s schedule', icon: '📋', href: '/assistant/core?q=What\'s on my calendar today?' },
    { label: 'Set reminder', icon: '🔔', href: '/reminders' },
  ]

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/assistant/core?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Ask anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </header>

      <section className="relative z-10 px-6 mb-6">
        <h2 className="text-sm text-purple-200/40 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 hover:bg-purple-900/30 hover:border-purple-500/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6">
        <h2 className="text-sm text-purple-200/40 mb-3">Suggested</h2>
        <div className="space-y-2">
          {[
            'What meetings do I have this week?',
            'Summarize my important emails',
            'Help me draft an email',
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSearch(suggestion)}
              className="w-full p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 hover:bg-purple-900/30 hover:border-purple-500/20 transition-colors text-left flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-sm">{suggestion}</span>
            </button>
          ))}
        </div>
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
          <Link href="/assistant/search" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-400">
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
          <Link href="/assistant/profile" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-300/40">
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
