'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shell, LogoMark, Button, ProgressBar, GlassCard } from '@/app/components'

const goals = [
  { id: 'scheduling', name: 'Smart scheduling', desc: 'Auto-schedule meetings around focus time', icon: '📅' },
  { id: 'emails', name: 'Email summaries', desc: 'Daily digest of important emails', icon: '✉️' },
  { id: 'reminders', name: 'Smart reminders', desc: 'Never miss a follow-up', icon: '🔔' },
  { id: 'tasks', name: 'Task automation', desc: 'Automate repetitive workflows', icon: '⚡' },
  { id: 'invoices', name: 'Invoice tracking', desc: 'Automatic payment reminders', icon: '💰' },
  { id: 'reports', name: 'Weekly reports', desc: 'Summarize your productivity', icon: '📊' },
]

export default function OnboardingFirstWins() {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  return (
    <Shell className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size="sm" />
          <span className="text-lg font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">MyCore</span>
        </div>
        <ProgressBar currentStep={3} totalSteps={5} />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-2 text-center bg-gradient-to-b from-white to-purple-200/80 bg-clip-text text-transparent">
            Choose your first wins
          </h1>
          <p className="text-purple-200/40 text-center mb-8">What would you like to automate first?</p>

          <div className="space-y-3 mb-8">
            {goals.map(goal => (
              <GlassCard
                key={goal.id}
                onClick={() => toggle(goal.id)}
                className={`p-4 cursor-pointer ${
                  selected.includes(goal.id) ? 'bg-purple-500/20 border-purple-500/40' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected.includes(goal.id) ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'
                  }`}>
                    {selected.includes(goal.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xl">{goal.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-purple-200/40">{goal.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <Link href="/consent">
            <Button fullWidth size="lg" disabled={selected.length === 0}>
              Continue
            </Button>
          </Link>
          <p className="text-center text-xs text-purple-300/30 mt-4">Select at least one to continue</p>
        </div>
      </main>
    </Shell>
  )
}
