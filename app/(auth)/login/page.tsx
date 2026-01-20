'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const logLogin = async (userId: string, userEmail: string) => {
    try {
      await fetch('/api/log-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: userEmail })
      })
    } catch (e) {
      console.error('Failed to log login')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (data.user) {
        await logLogin(data.user.id, data.user.email || email)
      }
      router.push('/assistant')
      router.refresh()
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mycore.uk/reset-password',

    })

    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
    setLoading(false)
  }

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-xl font-semibold">MyCore</span>
        </Link>
        <div className="max-w-md">
          <h1 className="text-5xl font-bold leading-tight mb-6">Welcome back.</h1>
          <p className="text-purple-200/40 text-lg">Sign in to continue managing your day.</p>
        </div>
        <div className="text-sm text-purple-300/30">© 2025 MyCore by ChiVera</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/30 border border-purple-500/10">
          <Link href="/home" className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-lg font-semibold">MyCore</span>
          </Link>

          {showReset ? (
            <>
              <h2 className="text-2xl font-bold mb-2">Reset password</h2>
              <p className="text-purple-200/40 mb-6">Enter your email to receive a reset link</p>

              {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
              
              {resetSent ? (
                <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <p className="font-medium mb-1">Check your email!</p>
                  <p className="text-sm text-green-400/70">We sent a password reset link to {email}</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-sm text-purple-200/60 block mb-2">Email</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
                  </button>
                </form>
              )}

              <button 
                onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
                className="w-full text-center text-sm text-purple-400 mt-6"
              >
                Back to sign in
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Sign in</h2>
              <p className="text-purple-200/40 mb-6">Enter your credentials</p>

              {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm text-purple-200/60 block mb-2">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                  />
                </div>
                <div>
                  <label className="text-sm text-purple-200/60 block mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="w-full bg-purple-950/30 border border-purple-500/20 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-purple-500/50" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-400"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="text-center text-sm text-purple-200/40 mt-6">
                No account? <Link href="/signup" className="text-purple-400">Sign up</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
