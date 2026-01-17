'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shell, LogoMark, Button, ProgressBar, GlassCard } from '@/app/components'

export default function OnboardingConsent() {
  const [mode, setMode] = useState('ask')

  return (
    <Shell className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size="sm" />
          <span className="text-lg font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">MyCore</span>
        </div>
        <ProgressBar currentStep={4} totalSteps={5} />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-center bg-gradient-to-b from-white to-purple-200/80 bg-clip-text text-transparent">
            Automation preferences
          </h1>
          <p className="text-purple-200/40 text-center mb-8">How should MyCore handle actions on your behalf?</p>

          <div className="space-y-3 mb-8">
            <GlassCard
              onClick={() => setMode('ask')}
              className={`p-5 cursor-pointer ${mode === 'ask' ? 'bg-purple-500/20 border-purple-500/40' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                  mode === 'ask' ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'
                }`}>
                  {mode === 'ask' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-medium mb-1">Ask before acting</p>
                  <p className="text-sm text-purple-200/40">I'll suggest actions and wait for your approval before executing them. You stay in full control.</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              onClick={() => setMode('auto')}
              className={`p-5 cursor-pointer ${mode === 'auto' ? 'bg-purple-500/20 border-purple-500/40' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                  mode === 'auto' ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'
                }`}>
                  {mode === 'auto' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-medium mb-1">Auto-pilot mode</p>
                  <p className="text-sm text-purple-200/40">I'll handle routine tasks automatically and notify you afterward. Best for trusted workflows.</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <Link href="/complete">
            <Button fullWidth size="lg">Continue</Button>
          </Link>
          <p className="text-center text-xs text-purple-300/30 mt-4">You can change this anytime in settings</p>
        </div>
      </main>
    </Shell>
  )
}
