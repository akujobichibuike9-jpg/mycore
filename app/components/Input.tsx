'use client'

import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-purple-200/60 font-medium">{label}</label>}
      <input
        className={`
          w-full bg-purple-950/30 border border-purple-500/20 
          rounded-xl px-4 py-4 text-white 
          placeholder:text-purple-300/30 
          focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/30 
          transition-all duration-300
          ${className}
        `}
        {...props}
      />
    </div>
  )
}
