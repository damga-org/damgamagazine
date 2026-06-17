'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Plus, Edit, FileText, Trash2, Newspaper, Megaphone, FilePenLine } from 'lucide-react'

export default function AdminDashboard() {
  const [newsletters, setNewsletters] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadNewsletters()
  }, [])

  const loadNewsletters = async () => {
    const { data } = await getSupabase()
      .from('newsletters')
      .select('*')
      .order('issue_month', { ascending: false })
    setNewsletters(data || [])
    setLoading(false)
  }

  const handlePublish = async (id) => {
    const res = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert('발행 실패: ' + (err.error || 'PDF 생성 중 오류가 발생했습니다'))
      return
    }
    const { error: updateError } = await getSupabase().from('newsletters').update({
      status: 'published',
      published_at: new Date().toISOString(),
    }).eq('id', id)
    if (updateError) {
      alert('상태 업데이트 실패: ' + updateError.message)
      return
    }
    loadNewsletters()
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await getSupabase().from('newsletters').delete().eq('id', id)
    loadNewsletters()
  }

  const filtered = filter === 'all'
    ? newsletters
    : newsletters.filter(n => n.status === filter)

  const draftCount = newsletters.filter(n => n.status === 'draft').length
  const publishedCount = newsletters.filter(n => n.status === 'published').length

  if (loading) return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-amber-900/10 rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-amber-900/10 rounded-xl" />)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">소식지 관리</h1>
          <p className="text-brand-charcoal/40 text-sm mt-1">전체 {newsletters.length}개 소식지</p>
        </div>
        <button onClick={() => router.push('/admin/new')}
          className="btn-primary flex items-center gap-2">
          <Plus size={18} /> 새 소식지
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-900/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-amber/10 flex items-center justify-center">
              <Newspaper size={18} className="text-brand-amber" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-charcoal">{newsletters.length}</p>
          <p className="text-xs text-brand-charcoal/40 mt-1">전체 소식지</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-900/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FilePenLine size={18} className="text-amber-700" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-charcoal">{draftCount}</p>
          <p className="text-xs text-brand-charcoal/40 mt-1">초안</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-900/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Megaphone size={18} className="text-emerald-700" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-charcoal">{publishedCount}</p>
          <p className="text-xs text-brand-charcoal/40 mt-1">발행됨</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'draft', 'published'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === f
                ? 'bg-brand-charcoal text-white shadow-lg shadow-brand-charcoal/20'
                : 'bg-white text-brand-charcoal/60 hover:text-brand-charcoal border border-amber-900/5'
            }`}>
            {f === 'all' ? '전체' : f === 'draft' ? '초안' : '발행됨'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((nl, idx) => (
          <div key={nl.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-amber-900/5
                       hover:shadow-md hover:border-brand-amber/20 transition-all duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-charcoal/5 to-brand-amber/5
                              flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-charcoal/30 font-bold text-sm">{idx + 1}</span>
                </div>
                <div>
                  <h3 className="font-bold text-brand-charcoal group-hover:text-brand-warm transition-colors">
                    {nl.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm">
                    <span className="text-brand-charcoal/40">
                      {new Date(nl.issue_month + '-01').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                    </span>
                    {nl.status === 'published' ? (
                      <span className="badge-published">발행 완료</span>
                    ) : (
                      <span className="badge-draft">초안</span>
                    )}
                    {nl.published_at && (
                      <span className="text-brand-charcoal/30 text-xs">
                        {new Date(nl.published_at).toLocaleDateString('ko-KR')} 발행
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => router.push(`/admin/edit/${nl.id}`)}
                  className="p-2.5 hover:bg-brand-charcoal/5 rounded-xl transition-colors"
                  title="수정">
                  <Edit size={16} className="text-brand-charcoal/40" />
                </button>
                {nl.status === 'draft' && (
                  <button onClick={() => handlePublish(nl.id)}
                    className="p-2.5 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="발행">
                    <FileText size={16} className="text-emerald-600" />
                  </button>
                )}
                <button onClick={() => handleDelete(nl.id)}
                  className="p-2.5 hover:bg-red-50 rounded-xl transition-colors"
                  title="삭제">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Newspaper size={28} className="text-brand-amber" />
            </div>
            <p className="text-brand-charcoal/50 font-medium">
              {filter === 'all' ? '첫 소식지를 작성해보세요' : '해당 상태의 소식지가 없습니다'}
            </p>
            {filter === 'all' && (
              <button onClick={() => router.push('/admin/new')}
                className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus size={16} /> 새 소식지 만들기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
