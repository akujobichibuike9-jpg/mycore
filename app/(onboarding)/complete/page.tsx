'use client'

import Link from 'next/link'
import { Shell, LogoMark, Button } from '@/app/components'

export default function OnboardingComplete() {
  return (
    <Shell className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size="sm" />
          <span className="text-lg font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">MyCore</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-b from-white to-purple-200/80 bg-clip-text text-transparent">
            You're all set!
          </h1>
          <p className="text-purple-200/40 text-lg mb-4">Your assistant is ready to help</p>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8 text-left">
            <p className="text-sm text-purple-200/60 mb-4">Here's what happens next:</p>
            <ul className="space-y-3">
              {[
                'Your dashboard will show today\'s priorities',
                'Suggested actions will appear as cards',
                'Tap "Approve" to let me handle tasks',
                'Check History to see what I\'ve done',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-purple-400">{i + 1}</span>
                  </div>
                  <span className="text-purple-200/50">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/assistant">
            <Button size="lg">
              Go to Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </main>
    </Shell>
  )
}
