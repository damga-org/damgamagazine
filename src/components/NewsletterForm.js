'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Save, Send, Calendar, Image, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'

export default function NewsletterForm({ newsletter = null }) {
  const [title, setTitle] = useState(newsletter?.title || '')
  const [issueMonth, setIssueMonth] = useState(newsletter?.issue_month?.slice(0, 7) || '')
  const [pages, setPages] = useState(newsletter?.content?.pages || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `pages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
    const { error: uploadError } = await getSupabase().storage
      .from('newsletter-assets')
      .upload(fileName, file)
    if (uploadError) throw new Error('이미지 업로드 실패: ' + uploadError.message)
    const { data: { publicUrl } } = getSupabase().storage
      .from('newsletter-assets')
      .getPublicUrl(fileName)
    return publicUrl
  }

  const handlePageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadImage))
      setPages(prev => [...prev, ...urls.map(url => ({ image_url: url }))])
    } catch (err) {
      alert(err.message)
    }
    setUploading(false)
    e.target.value = ''
  }

  const movePage = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= pages.length) return
    const updated = [...pages];
    [updated[index], updated[target]] = [updated[target], updated[index]]
    setPages(updated)
  }

  const removePage = (index) => {
    setPages(pages.filter((_, i) => i !== index))
  }

  const handleSave = async (status) => {
    setSaving(true)
    setError(null)

    if (!issueMonth) {
      alert('발행월을 선택해주세요')
      setSaving(false)
      return
    }
    if (pages.length === 0) {
      alert('최소 1개의 페이지 이미지를 업로드해주세요')
      setSaving(false)
      return
    }

    const payload = {
      title,
      issue_month: `${issueMonth}-01`,
      content: { pages },
      status,
      ...(status === 'published' ? { published_at: new Date().toISOString() } : {}),
    }

    try {
      let savedId = newsletter?.id

      if (savedId) {
        const { error: saveError } = await getSupabase().from('newsletters').update(payload).eq('id', savedId)
        if (saveError) throw saveError
      } else {
        const { data, error: saveError } = await getSupabase().from('newsletters').insert(payload).select('id').single()
        if (saveError) throw saveError
        savedId = data.id
      }

      if (status === 'published' && savedId) {
        fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: savedId }),
        }).catch(() => {})
      }

      setSaving(false)
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-charcoal">
          {newsletter ? '소식지 수정' : '새 소식지 작성'}
        </h1>
        <p className="text-sm text-brand-charcoal/40 mt-1">완성된 디자인 이미지를 페이지별로 업로드하세요</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-red-600 text-sm font-medium">저장 실패</p>
          <p className="text-red-500 text-xs mt-1">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-amber-900/5 p-6 md:p-8 space-y-6">
        <input placeholder="소식지 제목 (예: 2026년 6월호)" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-0 border-b-2 border-amber-900/10 px-0 pb-3 text-xl font-bold text-brand-charcoal
                     focus:outline-none focus:border-brand-amber/60 transition-colors
                     placeholder:text-brand-charcoal/20" />

        <div>
          <label className="section-title flex items-center gap-1.5 mb-2">
            <Calendar size={12} /> 발행월
          </label>
          <input type="month" value={issueMonth} onChange={(e) => setIssueMonth(e.target.value)} required
            className="input-premium max-w-[200px]" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-900/5 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-brand-charcoal">페이지 이미지</h2>
          <span className="text-xs text-brand-charcoal/30">{pages.length}페이지</span>
        </div>

        {pages.length > 0 && (
          <div className="space-y-3 mb-6">
            {pages.map((page, i) => (
              <div key={i}
                className="flex gap-4 items-start bg-brand-charcoal/[0.02] rounded-xl p-3 border border-amber-900/5">
                <div className="w-24 h-32 rounded-lg bg-cover bg-center flex-shrink-0 border border-amber-900/5 shadow-sm"
                  style={{ backgroundImage: `url(${page.image_url})` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-charcoal">페이지 {i + 1}</p>
                  <p className="text-xs text-brand-charcoal/30 mt-0.5 truncate">{page.image_url}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => movePage(i, -1)} disabled={i === 0}
                    className="p-1 hover:bg-brand-charcoal/5 rounded-lg disabled:opacity-20 transition-colors">
                    <ChevronUp size={14} className="text-brand-charcoal/40" />
                  </button>
                  <button type="button" onClick={() => movePage(i, 1)} disabled={i === pages.length - 1}
                    className="p-1 hover:bg-brand-charcoal/5 rounded-lg disabled:opacity-20 transition-colors">
                    <ChevronDown size={14} className="text-brand-charcoal/40" />
                  </button>
                  <button type="button" onClick={() => removePage(i)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className={`btn-outline inline-flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? (
            <><span className="w-4 h-4 border-2 border-brand-charcoal/20 border-t-brand-charcoal rounded-full animate-spin" /> 업로드 중...</>
          ) : (
            <><Plus size={16} /> 페이지 이미지 추가</>
          )}
          <input type="file" accept="image/*" multiple onChange={handlePageUpload} className="hidden" />
        </label>
        {pages.length === 0 && !uploading && (
          <p className="text-xs text-brand-charcoal/30 mt-3">완성된 디자인 이미지(PNG/JPG)를 페이지 순서대로 업로드하세요</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => handleSave('draft')} disabled={saving || !title || pages.length === 0}
          className="btn-outline flex items-center gap-2 disabled:opacity-50">
          <Save size={16} /> 초안 저장
        </button>
        <button onClick={() => handleSave('published')} disabled={saving || !title || pages.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              저장 중...
            </span>
          ) : (
            <><Send size={16} /> 발행하기</>
          )}
        </button>
      </div>
    </div>
  )
}