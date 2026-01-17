'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashScreen() {
  const router = useRouter()
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1500)
    const timer2 = setTimeout(() => router.push('/home'), 2000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [router])

  return (
    <div className={`min-h-screen bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
          <div className="w-6 h-6 rounded-full bg-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-purple-200/80 bg-clip-text text-transparent mb-2">
          MyCore
        </h1>
        <p className="text-purple-300/50 text-sm tracking-widest">ChiVera</p>
      </div>
    </div>
  )
}
