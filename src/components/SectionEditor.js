'use client'

import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

const sectionTypes = [
  { value: 'text', label: '텍스트' },
  { value: 'menu', label: '메뉴 아이템' },
  { value: 'notice', label: '공지사항' },
]

export default function SectionEditor({ sections, onChange }) {
  const addSection = (type) => {
    const base = { type, title: '' }
    const newSection = type === 'text' ? { ...base, body: '' }
      : type === 'menu' ? { ...base, items: [{ name: '', description: '', image_url: '' }] }
      : { ...base, body: '' }
    onChange([...sections, newSection])
  }

  const updateSection = (index, field, value) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const updateItem = (sectionIndex, itemIndex, field, value) => {
    const updated = [...sections]
    const items = [...updated[sectionIndex].items]
    items[itemIndex] = { ...items[itemIndex], [field]: value }
    updated[sectionIndex] = { ...updated[sectionIndex], items }
    onChange(updated)
  }

  const addItem = (sectionIndex) => {
    const updated = [...sections]
    updated[sectionIndex].items = [...(updated[sectionIndex].items || []), { name: '', description: '', image_url: '' }]
    onChange(updated)
  }

  const removeItem = (sectionIndex, itemIndex) => {
    const updated = [...sections]
    updated[sectionIndex].items = updated[sectionIndex].items.filter((_, i) => i !== itemIndex)
    onChange(updated)
  }

  const removeSection = (index) => {
    onChange(sections.filter((_, i) => i !== index))
  }

  const moveSection = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= sections.length) return
    const updated = [...sections];
    [updated[index], updated[target]] = [updated[target], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold">섹션</span>
        <div className="flex gap-1">
          {sectionTypes.map((t) => (
            <button key={t.value} type="button" onClick={() => addSection(t.value)}
              className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
              <Plus size={12} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {sections.map((section, si) => (
        <div key={si} className="border rounded-xl p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical size={16} className="text-gray-400" />
              <span className="text-xs bg-stone-100 px-2 py-0.5 rounded">
                {sectionTypes.find((t) => t.value === section.type)?.label}
              </span>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => moveSection(si, -1)} disabled={si === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronUp size={16} /></button>
              <button type="button" onClick={() => moveSection(si, 1)} disabled={si === sections.length - 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronDown size={16} /></button>
              <button type="button" onClick={() => removeSection(si)}
                className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 size={16} /></button>
            </div>
          </div>

          <input placeholder="섹션 제목" value={section.title}
            onChange={(e) => updateSection(si, 'title', e.target.value)}
            className="w-full border-b py-1 text-sm font-medium focus:outline-none focus:border-stone-800" />

          {section.type === 'text' && (
            <textarea placeholder="본문 내용을 입력하세요" rows={4} value={section.body}
              onChange={(e) => updateSection(si, 'body', e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400" />
          )}

          {section.type === 'notice' && (
            <textarea placeholder="공지 내용을 입력하세요" rows={3} value={section.body}
              onChange={(e) => updateSection(si, 'body', e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400" />
          )}

          {section.type === 'menu' && (
            <div className="space-y-2">
              {section.items?.map((item, ii) => (
                <div key={ii} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <input placeholder="메뉴명" value={item.name}
                      onChange={(e) => updateItem(si, ii, 'name', e.target.value)}
                      className="w-full border-b text-sm py-1 focus:outline-none focus:border-stone-800" />
                    <input placeholder="설명" value={item.description}
                      onChange={(e) => updateItem(si, ii, 'description', e.target.value)}
                      className="w-full border-b text-sm py-1 focus:outline-none focus:border-stone-800" />
                    <input placeholder="이미지 URL" value={item.image_url}
                      onChange={(e) => updateItem(si, ii, 'image_url', e.target.value)}
                      className="w-full border-b text-sm py-1 focus:outline-none focus:border-stone-800" />
                  </div>
                  <button type="button" onClick={() => removeItem(si, ii)}
                    className="p-1 text-red-400 hover:text-red-600 mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={() => addItem(si)}
                className="text-sm text-stone-600 hover:text-stone-800 flex items-center gap-1">
                <Plus size={14} /> 메뉴 추가
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
