'use client'

interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function LogoMark({ size = 'md' }: LogoMarkProps) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' }
  const dots = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }
  
  return (
    <div className={`relative ${sizes[size]}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600" />
      <div className="absolute inset-[2px] rounded-[10px] bg-black flex items-center justify-center">
        <div className={`${dots[size]} rounded-full bg-gradient-to-br from-purple-400 to-violet-400 animate-pulse`} />
      </div>
    </div>
  )
}
