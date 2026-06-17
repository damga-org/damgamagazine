'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { ArrowLeft, Download, Newspaper } from 'lucide-react'
import Link from 'next/link'

export default function NewsletterDetailPage() {
  const { id } = useParams()
  const [newsletter, setNewsletter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabase().from('newsletters').select('*').eq('id', id).eq('status', 'published').single()
      .then(({ data }) => {
        setNewsletter(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 mx-auto mb-4" />
          <p className="text-brand-charcoal/30">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Newspaper size={28} className="text-brand-amber" />
        </div>
        <p className="text-brand-charcoal/50 font-medium">소식지를 찾을 수 없습니다</p>
        <Link href="/" className="btn-outline inline-flex items-center gap-2">
          <ArrowLeft size={16} /> 목록으로
        </Link>
      </div>
    )
  }

  const pages = newsletter.content?.pages || []

  return (
    <main className="min-h-screen bg-brand-cream">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-charcoal/40 hover:text-brand-charcoal transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 목록으로
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-amber/20 to-brand-amber/10 flex items-center justify-center">
              <Newspaper size={16} className="text-brand-amber" />
            </div>
            <span className="text-brand-amber/70 font-medium text-sm">
              {new Date(newsletter.issue_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-brand-charcoal leading-tight">
            {newsletter.title}
          </h1>
        </div>

        <div className="space-y-6">
          {pages.map((page, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg shadow-amber-900/5 border border-amber-900/5 overflow-hidden">
              <img src={page.image_url} alt={`${newsletter.title} - 페이지 ${i + 1}`}
                className="w-full h-auto" />
              <div className="px-4 py-2 bg-brand-charcoal/5 text-center">
                <span className="text-xs text-brand-charcoal/40">{i + 1} / {pages.length}</span>
              </div>
            </div>
          ))}
        </div>

        {newsletter.pdf_url && (
          <div className="mt-8 text-center">
            <a href={newsletter.pdf_url} target="_blank" rel="noopener noreferrer"
              className="btn-accent inline-flex items-center gap-2">
              <Download size={16} /> PDF 다운로드
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
