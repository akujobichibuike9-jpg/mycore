'use client'

import Link from 'next/link'
import { Shell, LogoMark, Button, ProgressBar } from '@/app/components'

export default function OnboardingWelcome() {
  return (
    <Shell className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size="sm" />
          <span className="text-lg font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">MyCore</span>
        </div>
        <ProgressBar currentStep={0} totalSteps={5} />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-b from-white to-purple-200/80 bg-clip-text text-transparent">
            Welcome to MyCore
          </h1>
          <p className="text-purple-200/40 text-lg mb-8">Let's personalize your experience in a few quick steps</p>
          <Link href="/connect">
            <Button size="lg">
              Let's go
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
