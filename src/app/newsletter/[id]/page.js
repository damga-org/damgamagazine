'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import SectionRenderer from '@/components/SectionRenderer'
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

  return (
    <main className="min-h-screen bg-brand-cream">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-charcoal/40 hover:text-brand-charcoal transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 목록으로
        </Link>

        <article className="bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-900/5 overflow-hidden">
          {newsletter.cover_image && (
            <div className="w-full h-64 md:h-80 bg-cover bg-center"
              style={{ backgroundImage: `url(${newsletter.cover_image})` }} />
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
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

            <div className="mt-10 space-y-10">
              {newsletter.content?.sections?.map((section, i) => (
                <SectionRenderer key={i} section={section} />
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-amber-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-brand-charcoal/30">
                담가화로구이 가맹점 소식지
              </p>
              {newsletter.pdf_url && (
                <a href={newsletter.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="btn-accent inline-flex items-center gap-2">
                  <Download size={16} /> PDF 다운로드
                </a>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
