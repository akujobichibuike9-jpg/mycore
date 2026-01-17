'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === currentStep 
              ? 'w-8 bg-purple-500' 
              : i < currentStep 
                ? 'w-4 bg-purple-500/50' 
                : 'w-4 bg-purple-500/20'
          }`}
        />
      ))}
    </div>
  )
}
