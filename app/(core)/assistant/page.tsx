'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
}

interface Email {
  id: string
  from: string
  subject: string
  snippet: string
}

export default function AssistantHome() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [emails, setEmails] = useState<Email[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [calRes, emailRes] = await Promise.all([
          fetch('/api/calendar'),
          fetch('/api/gmail'),
        ])
        
        if (calRes.ok) {
          const calData = await calRes.json()
          setEvents(calData.events || [])
        }
        
        if (emailRes.ok) {
          const emailData = await emailRes.json()
          setEmails(emailData.emails || [])
          setUnreadCount(emailData.unreadCount || 0)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-purple-200/40 text-sm">{formatDate()}</p>
            <h1 className="text-2xl font-bold">{getGreeting()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/connect" className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center">
            <p className="text-xl font-bold">{events.length}</p>
            <p className="text-xs text-purple-300/40">Events</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center">
            <p className="text-xl font-bold">{unreadCount}</p>
            <p className="text-xs text-purple-300/40">Unread</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center">
            <p className="text-xl font-bold">0</p>
            <p className="text-xs text-purple-300/40">Tasks</p>
          </div>
        </div>
      </header>

      {/* Calendar Events */}
      <section className="relative z-10 px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
        </div>
        
        {loading ? (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center text-purple-300/40">
            Loading...
          </div>
        ) : events.length === 0 ? (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center text-purple-300/40">
            No upcoming events
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-sm text-purple-200/40">{formatTime(event.start)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Emails */}
      <section className="relative z-10 px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Emails</h2>
          <span className="text-sm text-purple-400">{unreadCount} unread</span>
        </div>
        
        {loading ? (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center text-purple-300/40">
            Loading...
          </div>
        ) : emails.length === 0 ? (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 text-center text-purple-300/40">
            No unread emails
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 space-y-3">
            {emails.slice(0, 4).map((email, i) => (
              <div key={email.id} className={`flex items-center gap-3 ${i < emails.length - 1 ? 'pb-3 border-b border-purple-500/10' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-purple-300">
                    {email.from?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{email.from?.split('<')[0]?.trim() || 'Unknown'}</p>
                  <p className="text-xs text-purple-200/40 truncate">{email.subject}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Action */}
      <section className="relative z-10 px-6">
        <Link href="/assistant/core">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-violet-500/10 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">Ask MyCore</p>
                <p className="text-sm text-purple-200/40">Chat with your AI assistant</p>
              </div>
              <svg className="w-5 h-5 text-purple-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
        <div className="flex items-center justify-around py-3 mx-auto max-w-md rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <Link href="/assistant" className="flex flex-col items-center gap-1 px-3 py-2 text-purple-400">
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
