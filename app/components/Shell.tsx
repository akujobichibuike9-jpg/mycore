'use client'

import { ReactNode } from 'react'

interface ShellProps {
  children: ReactNode
  className?: string
  showOrbs?: boolean
}

export default function Shell({ children, className = '', showOrbs = true }: ShellProps) {
  return (
    <div className={`min-h-screen bg-black text-white overflow-hidden relative ${className}`}>
      {showOrbs && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Simplified orbs - no blur, just opacity gradients for performance */}
          <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-gradient-radial from-purple-600/30 to-transparent" />
          <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-gradient-radial from-violet-700/20 to-transparent" />
          <div className="absolute w-[350px] h-[350px] -bottom-16 left-1/4 rounded-full bg-gradient-radial from-purple-800/30 to-transparent" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
