'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Newspaper } from 'lucide-react'

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/admin/login')
    }
  }, [session, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-charcoal to-brand-warm flex items-center justify-center mx-auto mb-4">
            <Newspaper size={20} className="text-brand-amber" />
          </div>
          <p className="text-brand-charcoal/30 text-sm">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
