'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export default function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}: ButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm'
  }

  if (variant === 'secondary') {
    return (
      <button 
        className={`
          ${sizes[size]} ${fullWidth ? 'w-full' : ''}
          rounded-full font-medium
          bg-purple-500/10 border border-purple-500/20 
          hover:bg-purple-500/20 hover:border-purple-500/30 
          transition-all duration-300 text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button 
      className={`
        group relative ${sizes[size]} ${fullWidth ? 'w-full' : ''}
        rounded-full overflow-hidden font-semibold tracking-wide
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 transition-all duration-300 group-hover:scale-105" />
      <span className="relative z-10 flex items-center justify-center gap-2 text-white">
        {children}
      </span>
    </button>
  )
}
