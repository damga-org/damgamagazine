'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import SectionRenderer from '@/components/SectionRenderer'
import { ArrowLeft, Download } from 'lucide-react'
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
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">소식지를 찾을 수 없습니다</p>
        <Link href="/" className="text-stone-600 underline">목록으로</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-stone-800 mb-6">
          <ArrowLeft size={16} /> 목록으로
        </Link>

        {newsletter.cover_image && (
          <div className="w-full h-56 rounded-2xl bg-cover bg-center mb-6"
            style={{ backgroundImage: `url(${newsletter.cover_image})` }} />
        )}

        <h1 className="text-3xl font-bold mb-2">{newsletter.title}</h1>
        <p className="text-gray-500 mb-8">
          {new Date(newsletter.issue_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </p>

        <div className="space-y-8 mb-8">
          {newsletter.content?.sections?.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>

        {newsletter.pdf_url && (
          <a href={newsletter.pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors">
            <Download size={18} /> PDF 다운로드
          </a>
        )}
      </div>
    </main>
  )
}
