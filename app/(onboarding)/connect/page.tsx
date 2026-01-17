'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const tools = [
  { id: 'google', name: 'Google', icon: '📅', desc: 'Calendar & Gmail', connectUrl: '/api/auth/google' },
  { id: 'outlook', name: 'Outlook', icon: '📧', desc: 'Coming soon', connectUrl: null },
  { id: 'notion', name: 'Notion', icon: '📝', desc: 'Coming soon', connectUrl: null },
  { id: 'slack', name: 'Slack', icon: '💬', desc: 'Coming soon', connectUrl: null },
]

export default function ConnectPage() {
  const searchParams = useSearchParams()
  const [connected, setConnected] = useState<string[]>([])
  
  useEffect(() => {
    if (searchParams.get('success') === 'google') {
      setConnected(prev => [...prev, 'google'])
    }
  }, [searchParams])

  const handleConnect = (tool: typeof tools[0]) => {
    if (tool.connectUrl) {
      window.location.href = tool.connectUrl
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-24 rounded-full bg-purple-600/30" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-24 rounded-full bg-violet-700/20" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="text-lg font-semibold">MyCore</span>
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 2 ? 'w-8 bg-purple-500' : i < 2 ? 'w-4 bg-purple-500/50' : 'w-4 bg-purple-500/20'}`} />
          ))}
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-2 text-center">Connect your tools</h1>
          <p className="text-purple-200/40 text-center mb-8">Integrate your existing workflow</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {tools.map(tool => (
              <div
                key={tool.id}
                onClick={() => handleConnect(tool)}
                className={`p-4 rounded-2xl border transition-all ${
                  connected.includes(tool.id) 
                    ? 'bg-green-500/20 border-green-500/40' 
                    : tool.connectUrl 
                      ? 'bg-purple-950/30 border-purple-500/10 hover:bg-purple-900/30 cursor-pointer' 
                      : 'bg-purple-950/20 border-purple-500/5 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-purple-300/40">{tool.desc}</p>
                  </div>
                  {connected.includes(tool.id) && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link href="/preferences" className="flex-1">
              <button className="w-full py-3 rounded-full bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20">
                Skip for now
              </button>
            </Link>
            <Link href="/preferences" className="flex-1">
              <button className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold">
                Continue
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
