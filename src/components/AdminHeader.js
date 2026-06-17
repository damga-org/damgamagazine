'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { LogOut } from 'lucide-react'

export default function AdminHeader() {
  const { session } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await getSupabase().auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="gradient-header">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-amber/20 flex items-center justify-center">
            <span className="text-brand-amber font-bold text-sm">담</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">담가화로구이</h1>
            <p className="text-white/40 text-[10px]">관리자</p>
          </div>
        </div>
        {session && (
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/90 text-xs transition-colors">
            <LogOut size={12} />
            로그아웃
          </button>
        )}
      </div>
    </header>
  )
}