'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import NewsletterCard from '@/components/NewsletterCard'
import { Newspaper, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [newsletters, setNewsletters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabase()
      .from('newsletters')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }) => setNewsletters(data || []))
      .catch(() => setNewsletters([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen">
      <header className="gradient-header relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-amber/20 flex items-center justify-center">
              <Newspaper size={20} className="text-brand-amber" />
            </div>
            <span className="text-brand-amber/80 text-sm font-medium tracking-widest uppercase">Monthly</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            담가화로구이<br />
            <span className="text-brand-amber font-bold">소식지</span>
          </h1>
          <p className="text-white/70 mt-4 text-lg max-w-xl leading-relaxed">
            가맹점주님을 위한 월간 소식을 전해드립니다
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/40 text-sm">
            <Sparkles size={14} />
            <span>매월 새로운 소식을 확인하세요</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pb-20 -mt-4">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-900/5 animate-pulse">
                <div className="h-44 bg-amber-900/10" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-amber-900/10 rounded w-3/4" />
                  <div className="h-3 bg-amber-900/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-20 mt-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Newspaper size={28} className="text-brand-amber" />
            </div>
            <p className="text-brand-charcoal/50 text-lg font-medium">첫 소식지를 기다리고 있어요</p>
            <p className="text-brand-charcoal/30 text-sm mt-1">곧 발행될 예정입니다</p>
          </div>
        ) : (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <p className="text-brand-charcoal/50 text-sm">
                총 <span className="font-semibold text-brand-charcoal/70">{newsletters.length}</span>개의 소식지
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {newsletters.map((nl) => (
                <NewsletterCard key={nl.id} newsletter={nl} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
