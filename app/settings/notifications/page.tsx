'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NotificationsPage() {
  const [emailReminders, setEmailReminders] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if push is supported
    setPushSupported('Notification' in window && 'serviceWorker' in navigator)
    
    // Check current permission
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }

    // Load saved preferences
    const prefs = localStorage.getItem('notification_prefs')
    if (prefs) {
      const parsed = JSON.parse(prefs)
      setEmailReminders(parsed.emailReminders ?? true)
    }
  }, [])

  const enablePushNotifications = async () => {
    setLoading(true)
    setError('')

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        setError('Notification permission denied')
        setLoading(false)
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Save subscription to server
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      })

      if (res.ok) {
        setPushEnabled(true)
      } else {
        setError('Failed to save subscription')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enable notifications')
    }

    setLoading(false)
  }

  const disablePushNotifications = async () => {
    setLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
      }

      await fetch('/api/push-subscribe', { method: 'DELETE' })
      setPushEnabled(false)
    } catch (err) {
      console.error('Failed to unsubscribe:', err)
    }

    setLoading(false)
  }

  const savePrefs = () => {
    localStorage.setItem('notification_prefs', JSON.stringify({
      emailReminders,
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <header className="relative z-10 px-6 pt-12 pb-6">
        <Link href="/assistant/profile" className="flex items-center gap-2 text-purple-400 mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-purple-200/40 text-sm mt-1">Manage how MyCore notifies you</p>
      </header>

      <section className="relative z-10 px-6 space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Push Notifications */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push notifications</p>
              <p className="text-sm text-purple-300/40">Get notified even when app is closed</p>
            </div>
            {pushSupported ? (
              <button
                onClick={pushEnabled ? disablePushNotifications : enablePushNotifications}
                disabled={loading}
                className={`w-12 h-7 rounded-full transition-colors ${pushEnabled ? 'bg-purple-500' : 'bg-purple-500/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            ) : (
              <span className="text-xs text-purple-300/40">Not supported</span>
            )}
          </div>
          {pushEnabled && (
            <div className="mt-3 p-2 rounded-lg bg-green-500/10 text-green-400 text-xs">
              ✓ Push notifications enabled
            </div>
          )}
        </div>

        {/* Email Reminders */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 flex items-center justify-between">
          <div>
            <p className="font-medium">Email reminders</p>
            <p className="text-sm text-purple-300/40">Get reminded via email</p>
          </div>
          <button
            onClick={() => setEmailReminders(!emailReminders)}
            className={`w-12 h-7 rounded-full transition-colors ${emailReminders ? 'bg-purple-500' : 'bg-purple-500/20'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailReminders ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Test Notification */}
        {pushEnabled && (
          <button
            onClick={() => {
              new Notification('MyCore Test', {
                body: 'Push notifications are working!',
                icon: '/icons/icon-192x192.png'
              })
            }}
            className="w-full p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/20"
          >
            Send test notification
          </button>
        )}

        <button
          onClick={savePrefs}
          className="w-full py-4 mt-6 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold"
        >
          {saved ? '✓ Saved!' : 'Save preferences'}
        </button>
      </section>
    </div>
  )
}
