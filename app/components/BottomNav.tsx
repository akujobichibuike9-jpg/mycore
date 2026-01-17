'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlassCard from './GlassCard'

const navItems = [
  { id: 'home', path: '/assistant', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'search', path: '/assistant/search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'core', path: '/assistant/core', label: '', isCore: true },
  { id: 'history', path: '/assistant/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'profile', path: '/assistant/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
      <GlassCard className="flex items-center justify-around py-3 mx-auto max-w-md">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          
          if (item.isCore) {
            return (
              <Link key={item.id} href={item.path} className="flex flex-col items-center">
                <div className="w-14 h-14 -mt-8 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
                  <div className="w-5 h-5 rounded-full bg-white" />
                </div>
              </Link>
            )
          }
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive ? 'text-purple-400' : 'text-purple-300/40 hover:text-purple-300/60'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </GlassCard>
    </nav>
  )
}
