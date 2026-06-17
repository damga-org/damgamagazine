'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { LockKeyhole, Newspaper } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await getSupabase().auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #2D1810 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="w-full max-w-sm mx-auto px-4 relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-charcoal to-brand-warm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-charcoal/20">
            <Newspaper size={24} className="text-brand-amber" />
          </div>
          <h1 className="text-xl font-bold text-brand-charcoal">담가화로구이</h1>
          <p className="text-brand-charcoal/40 text-sm mt-1">관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-xl shadow-amber-900/5 border border-amber-900/5 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <LockKeyhole size={14} className="text-brand-charcoal/30" />
            <span className="text-xs text-brand-charcoal/40 font-medium uppercase tracking-wider">인증 필요</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-brand-charcoal/50 mb-1.5">이메일</label>
            <input type="email" placeholder="admin@damga.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="input-premium" />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-charcoal/50 mb-1.5">비밀번호</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="input-premium" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                로그인 중...
              </span>
            ) : '로그인'}
          </button>
        </form>

        <p className="text-center text-xs text-brand-charcoal/25 mt-6">
          담가화로구이 가맹점 소식지 관리 시스템
        </p>
      </div>
    </div>
  )
}
