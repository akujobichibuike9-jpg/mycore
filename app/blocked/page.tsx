'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BlockedPage() {
  useEffect(() => {
    // Sign out the blocked user
    const supabase = createClient()
    supabase.auth.signOut()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-red-600/20" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-red-700/10" />
      </div>
      
      <div className="text-center relative z-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-3">Account Blocked</h1>
        <p className="text-red-200/60 max-w-md mb-6">
          Your account has been blocked by an administrator. If you believe this is an error, please contact support.
        </p>
        <a href="/login" className="px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          Back to Login
        </a>
      </div>
    </div>
  )
}
