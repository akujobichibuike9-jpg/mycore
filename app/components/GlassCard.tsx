'use client'

import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className = '', glow = false, onClick }: GlassCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative bg-purple-950/30
        border border-purple-500/10 rounded-2xl
        hover:bg-purple-900/30 hover:border-purple-500/20 
        transition-colors duration-200
        ${glow ? 'shadow-lg shadow-purple-500/20' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
