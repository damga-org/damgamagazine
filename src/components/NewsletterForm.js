'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import SectionEditor from './SectionEditor'
import { Save, Send, Image, Calendar } from 'lucide-react'

export default function NewsletterForm({ newsletter = null }) {
  const [title, setTitle] = useState(newsletter?.title || '')
  const [issueMonth, setIssueMonth] = useState(newsletter?.issue_month?.slice(0, 7) || '')
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(newsletter?.cover_image || '')
  const [sections, setSections] = useState(newsletter?.content?.sections || [])
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleSave = async (status) => {
    setSaving(true)

    let coverImageUrl = newsletter?.cover_image || ''

    if (coverImage) {
      const fileExt = coverImage.name.split('.').pop()
      const fileName = `covers/${Date.now()}.${fileExt}`
      const { error: uploadError } = await getSupabase().storage
        .from('newsletter-assets')
        .upload(fileName, coverImage)
      if (!uploadError) {
        const { data: { publicUrl } } = getSupabase().storage
          .from('newsletter-assets')
          .getPublicUrl(fileName)
        coverImageUrl = publicUrl
      } else {
        alert('이미지 업로드에 실패했습니다')
      }
    }

    if (!issueMonth) {
      alert('발행월을 선택해주세요')
      setSaving(false)
      return
    }

    const payload = {
      title,
      issue_month: `${issueMonth}-01`,
      content: { sections },
      cover_image: coverImageUrl,
      status,
    }

    if (newsletter?.id) {
      await getSupabase().from('newsletters').update(payload).eq('id', newsletter.id)
    } else {
      await getSupabase().from('newsletters').insert(payload)
    }

    setSaving(false)
    router.push('/admin')
    router.refresh()
  }

  const handleMenuItemImageUpload = async (sectionIndex, itemIndex, file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `menu/${Date.now()}-${itemIndex}.${fileExt}`
    const { error } = await getSupabase().storage
      .from('newsletter-assets')
      .upload(fileName, file)
    if (error) {
      alert('메뉴 이미지 업로드에 실패했습니다')
      return
    }
    const { data: { publicUrl } } = getSupabase().storage
      .from('newsletter-assets')
      .getPublicUrl(fileName)

    const updated = [...sections]
    const items = [...updated[sectionIndex].items]
    items[itemIndex] = { ...items[itemIndex], image_url: publicUrl }
    updated[sectionIndex] = { ...updated[sectionIndex], items }
    setSections(updated)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-charcoal">
          {newsletter ? '소식지 수정' : '새 소식지 작성'}
        </h1>
        <p className="text-sm text-brand-charcoal/40 mt-1">가맹점에 전할 소식을 작성하세요</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-900/5 p-6 md:p-8 space-y-6">
        <input placeholder="소식지 제목 (예: 2026년 6월호)" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-0 border-b-2 border-amber-900/10 px-0 pb-3 text-xl font-bold text-brand-charcoal
                     focus:outline-none focus:border-brand-amber/60 transition-colors
                     placeholder:text-brand-charcoal/20" />

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="section-title flex items-center gap-1.5 mb-2">
              <Calendar size={12} /> 발행월
            </label>
            <input type="month" value={issueMonth} onChange={(e) => setIssueMonth(e.target.value)} required
              className="input-premium" />
          </div>

          <div>
            <label className="section-title flex items-center gap-1.5 mb-2">
              <Image size={12} /> 커버 이미지
            </label>
            <div className="flex items-center gap-3">
              {coverPreview && (
                <div className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0 border border-amber-900/5"
                  style={{ backgroundImage: `url(${coverPreview})` }} />
              )}
              <label className="btn-outline text-sm cursor-pointer inline-flex items-center gap-1.5">
                <Image size={14} />
                {coverPreview ? '변경' : '업로드'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-900/5 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-brand-charcoal">섹션 편집</h2>
          <span className="text-xs text-brand-charcoal/30">{sections.length}개 섹션</span>
        </div>
        <SectionEditor sections={sections} onChange={setSections} onImageUpload={handleMenuItemImageUpload} />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => handleSave('draft')} disabled={saving || !title}
          className="btn-outline flex items-center gap-2 disabled:opacity-50">
          <Save size={16} /> 초안 저장
        </button>
        <button onClick={() => handleSave('published')} disabled={saving || !title}
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
