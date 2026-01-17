'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shell, LogoMark, Button, ProgressBar, GlassCard } from '@/app/components'

const preferences = [
  { id: 'morning', label: 'Morning person', desc: 'Schedule focus time early' },
  { id: 'evening', label: 'Night owl', desc: 'Peak productivity later' },
  { id: 'flexible', label: 'Flexible schedule', desc: 'Adapt throughout the day' },
]

const workStyles = [
  { id: 'deep', label: 'Deep work blocks', desc: 'Long uninterrupted sessions' },
  { id: 'pomodoro', label: 'Pomodoro style', desc: 'Short focused bursts' },
  { id: 'meetings', label: 'Meeting heavy', desc: 'Lots of collaboration' },
]

export default function OnboardingPreferences() {
  const [schedule, setSchedule] = useState('')
  const [workStyle, setWorkStyle] = useState('')

  return (
    <Shell className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size="sm" />
          <span className="text-lg font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">MyCore</span>
        </div>
        <ProgressBar currentStep={2} totalSteps={5} />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-2 text-center bg-gradient-to-b from-white to-purple-200/80 bg-clip-text text-transparent">
            Your preferences
          </h1>
          <p className="text-purple-200/40 text-center mb-8">Help us understand your work style</p>

          <div className="mb-6">
            <p className="text-sm text-purple-200/60 mb-3">When are you most productive?</p>
            <div className="space-y-2">
              {preferences.map(pref => (
                <GlassCard
                  key={pref.id}
                  onClick={() => setSchedule(pref.id)}
                  className={`p-4 cursor-pointer flex items-center gap-4 ${
                    schedule === pref.id ? 'bg-purple-500/20 border-purple-500/40' : ''
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    schedule === pref.id ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'
                  }`}>
                    {schedule === pref.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{pref.label}</p>
                    <p className="text-xs text-purple-300/40">{pref.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm text-purple-200/60 mb-3">How do you like to work?</p>
            <div className="space-y-2">
              {workStyles.map(style => (
                <GlassCard
                  key={style.id}
                  onClick={() => setWorkStyle(style.id)}
                  className={`p-4 cursor-pointer flex items-center gap-4 ${
                    workStyle === style.id ? 'bg-purple-500/20 border-purple-500/40' : ''
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    workStyle === style.id ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'
                  }`}>
                    {workStyle === style.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{style.label}</p>
                    <p className="text-xs text-purple-300/40">{style.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <Link href="/first-wins">
            <Button fullWidth size="lg">Continue</Button>
          </Link>
        </div>
      </main>
    </Shell>
  )
}
