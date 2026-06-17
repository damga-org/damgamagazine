'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import SectionEditor from './SectionEditor'
import { Save, Send } from 'lucide-react'

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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{newsletter ? '소식지 수정' : '새 소식지 작성'}</h1>

      <div className="space-y-4">
        <input placeholder="소식지 제목 (예: 2026년 6월호)" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400" />

        <div>
          <label className="block text-sm text-gray-500 mb-1">발행월</label>
          <input type="month" value={issueMonth} onChange={(e) => setIssueMonth(e.target.value)} required
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-stone-400" />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">커버 이미지</label>
          {coverPreview && <img src={coverPreview} alt="cover" className="w-40 h-28 object-cover rounded-lg mb-2" />}
          <input type="file" accept="image/*" onChange={handleImageUpload}
            className="text-sm" />
        </div>

        <SectionEditor sections={sections} onChange={setSections} onImageUpload={handleMenuItemImageUpload} />
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={() => handleSave('draft')} disabled={saving || !title}
          className="flex items-center gap-2 px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <Save size={18} /> 초안 저장
        </button>
        <button onClick={() => handleSave('published')} disabled={saving || !title}
          className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50">
          <Send size={18} /> {saving ? '저장 중...' : '발행'}
        </button>
      </div>
    </div>
  )
}
