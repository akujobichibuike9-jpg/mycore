'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Reminder {
  id: string
  title: string
  description: string
  remind_at: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    const res = await fetch('/api/reminders')
    if (res.ok) {
      const data = await res.json()
      setReminders(data.reminders)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !time) return

    setLoading(true)
    const remindAt = new Date(`${date}T${time}`).toISOString()

    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, remindAt })
    })

    if (res.ok) {
      setMessage('Reminder set! You\'ll receive an email notification.')
      setTitle('')
      setDescription('')
      setDate('')
      setTime('')
      fetchReminders()
    } else {
      setMessage('Failed to set reminder')
    }
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const deleteReminder = async (id: string) => {
    await fetch('/api/reminders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchReminders()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-6">
        <Link href="/assistant" className="flex items-center gap-2 text-purple-400 mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold">Set Reminder</h1>
        <p className="text-purple-200/40 text-sm mt-1">Get notified via email</p>
      </header>

      <section className="relative z-10 px-6">
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="text-sm text-purple-200/60 block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What to remind you about?"
              required
              className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-sm text-purple-200/60 block mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-purple-200/60 block mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-purple-200/60 block mb-2">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold disabled:opacity-50"
          >
            {loading ? 'Setting...' : 'Set Reminder'}
          </button>
        </form>

        {/* Existing Reminders */}
        {reminders.length > 0 && (
          <div>
            <h2 className="text-sm text-purple-200/40 mb-3">Your reminders</h2>
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{reminder.title}</p>
                    <p className="text-sm text-purple-300/40">{formatDate(reminder.remind_at)}</p>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
