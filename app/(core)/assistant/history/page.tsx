'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HistoryItem {
  id: string
  type: 'chat' | 'calendar' | 'email'
  action: string
  description: string
  time: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from your database
    // For now, showing empty state since we don't have history storage yet
    setLoading(false)
    setHistory([])
  }, [])

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-purple-200/40 text-sm mt-1">Actions performed by MyCore</p>
      </header>

      <section className="relative z-10 px-6">
        {loading ? (
          <div className="p-8 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center text-purple-300/40">
            Loading...
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-purple-200/60 font-medium mb-2">No history yet</p>
            <p className="text-purple-300/40 text-sm mb-4">Actions you take with MyCore will appear here</p>
            <Link href="/assistant/core">
              <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold text-sm">
                Start chatting
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-purple-200/40">{item.description}</p>
                  </div>
                  <span className="text-xs text-purple-300/30">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <Link href="/assistant/history" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-400">
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
