'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AppearancePage() {
  const router = useRouter()
  const [accentColor, setAccentColor] = useState('purple')
  const [saved, setSaved] = useState(false)

  const colors = [
    { id: 'purple', name: 'Purple', primary: '#a855f7', secondary: '#7c3aed' },
    { id: 'blue', name: 'Blue', primary: '#3b82f6', secondary: '#2563eb' },
    { id: 'green', name: 'Green', primary: '#22c55e', secondary: '#16a34a' },
    { id: 'pink', name: 'Pink', primary: '#ec4899', secondary: '#db2777' },
    { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('accent_color')
    if (saved) {
      setAccentColor(saved)
    }
  }, [])

  const savePrefs = () => {
    localStorage.setItem('accent_color', accentColor)
    
    // Apply color to CSS variables
    const color = colors.find(c => c.id === accentColor)
    if (color) {
      document.documentElement.style.setProperty('--accent-primary', color.primary)
      document.documentElement.style.setProperty('--accent-secondary', color.secondary)
    }
    
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      router.refresh()
    }, 1000)
  }

  const getColorClass = (colorId: string) => {
    switch(colorId) {
      case 'purple': return 'bg-purple-500'
      case 'blue': return 'bg-blue-500'
      case 'green': return 'bg-green-500'
      case 'pink': return 'bg-pink-500'
      case 'orange': return 'bg-orange-500'
      default: return 'bg-purple-500'
    }
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
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-purple-200/40 text-sm mt-1">Customize how MyCore looks</p>
      </header>

      <section className="relative z-10 px-6 space-y-6">
        {/* Theme */}
        <div>
          <p className="text-sm text-purple-200/40 mb-3">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40">
              <div className="w-8 h-8 rounded-lg bg-black border border-purple-500/20 mb-2" />
              <p className="font-medium">Dark</p>
              <p className="text-xs text-green-400">Active</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10 opacity-50">
              <div className="w-8 h-8 rounded-lg bg-white border border-purple-500/20 mb-2" />
              <p className="font-medium">Light</p>
              <p className="text-xs text-purple-300/40">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <p className="text-sm text-purple-200/40 mb-3">Accent color</p>
          <div className="flex gap-3">
            {colors.map(color => (
              <button
                key={color.id}
                onClick={() => setAccentColor(color.id)}
                className={`w-12 h-12 rounded-xl ${getColorClass(color.id)} transition-all ${
                  accentColor === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-purple-300/60 mt-3">
            Selected: <span className="font-medium capitalize">{accentColor}</span>
          </p>
        </div>

        {/* Preview */}
        <div>
          <p className="text-sm text-purple-200/40 mb-3">Preview</p>
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${getColorClass(accentColor)} flex items-center justify-center`}>
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <div>
                <p className="font-medium">MyCore</p>
                <p className="text-xs text-purple-300/40">Your AI assistant</p>
              </div>
            </div>
            <button className={`w-full py-3 rounded-full font-semibold text-white ${
              accentColor === 'purple' ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
              accentColor === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
              accentColor === 'green' ? 'bg-gradient-to-r from-green-600 to-green-500' :
              accentColor === 'pink' ? 'bg-gradient-to-r from-pink-600 to-pink-500' :
              'bg-gradient-to-r from-orange-600 to-orange-500'
            }`}>
              Sample Button
            </button>
          </div>
        </div>

        <button
          onClick={savePrefs}
          className={`w-full py-4 mt-6 rounded-full font-semibold transition-all ${
            saved 
              ? 'bg-green-500 text-white' 
              : accentColor === 'purple' ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
                accentColor === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
                accentColor === 'green' ? 'bg-gradient-to-r from-green-600 to-green-500' :
                accentColor === 'pink' ? 'bg-gradient-to-r from-pink-600 to-pink-500' :
                'bg-gradient-to-r from-orange-600 to-orange-500'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save preferences'}
        </button>

        <p className="text-xs text-purple-300/40 text-center">
          Note: Full app theming coming in a future update
        </p>
      </section>
    </div>
  )
}
