'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa_prompt_dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000
      if (dismissedTime > dayAgo) return
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Show iOS prompt after delay
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="p-4 rounded-2xl bg-purple-950/90 border border-purple-500/20 backdrop-blur-sm shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 rounded-full bg-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Install MyCore</h3>
            {isIOS ? (
              <p className="text-sm text-purple-200/60">
                Tap <span className="inline-flex items-center"><svg className="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span> then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-sm text-purple-200/60">
                Install for quick access and offline use
              </p>
            )}
          </div>
        </div>
        
        {!isIOS && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium"
            >
              Install
            </button>
          </div>
        )}
        
        {isIOS && (
          <button
            onClick={handleDismiss}
            className="w-full py-2 mt-4 rounded-full bg-purple-500/20 text-purple-300 text-sm"
          >
            Got it
          </button>
        )}
      </div>
    </div>
  )
}
