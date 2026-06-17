'use client'

import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Image, Type, Bell, Utensils } from 'lucide-react'

const sectionTypes = [
  { value: 'text', label: '텍스트', icon: Type },
  { value: 'menu', label: '메뉴 아이템', icon: Utensils },
  { value: 'notice', label: '공지사항', icon: Bell },
]

const typeIcons = { text: Type, menu: Utensils, notice: Bell }

export default function SectionEditor({ sections, onChange, onImageUpload }) {
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
      <div className="flex flex-wrap gap-2">
        {sectionTypes.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.value} type="button" onClick={() => addSection(t.value)}
              className="btn-outline text-sm inline-flex items-center gap-1.5 py-1.5 px-3">
              <Icon size={14} /> {t.label} 추가
            </button>
          )
        })}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-amber-900/10 rounded-2xl">
          <p className="text-brand-charcoal/30 text-sm">위 버튼을 눌러 섹션을 추가하세요</p>
        </div>
      )}

      {sections.map((section, si) => {
        const TypeIcon = typeIcons[section.type] || Type
        return (
          <div key={si} className="border border-amber-900/5 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GripVertical size={16} className="text-brand-charcoal/20" />
                <div className="w-7 h-7 rounded-lg bg-brand-charcoal/5 flex items-center justify-center">
                  <TypeIcon size={14} className="text-brand-charcoal/40" />
                </div>
                <span className="text-xs bg-brand-charcoal/5 text-brand-charcoal/60 px-2 py-0.5 rounded-lg font-medium">
                  {sectionTypes.find((t) => t.value === section.type)?.label}
                </span>
              </div>
              <div className="flex gap-0.5">
                <button type="button" onClick={() => moveSection(si, -1)} disabled={si === 0}
                  className="p-1.5 hover:bg-brand-charcoal/5 rounded-lg disabled:opacity-20 transition-colors">
                  <ChevronUp size={15} className="text-brand-charcoal/40" />
                </button>
                <button type="button" onClick={() => moveSection(si, 1)} disabled={si === sections.length - 1}
                  className="p-1.5 hover:bg-brand-charcoal/5 rounded-lg disabled:opacity-20 transition-colors">
                  <ChevronDown size={15} className="text-brand-charcoal/40" />
                </button>
                <button type="button" onClick={() => removeSection(si)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            </div>

            <input placeholder="섹션 제목 (선택)" value={section.title}
              onChange={(e) => updateSection(si, 'title', e.target.value)}
              className="w-full border-0 border-b border-amber-900/10 pb-1.5 text-sm font-medium
                         focus:outline-none focus:border-brand-amber/40 transition-colors
                         placeholder:text-brand-charcoal/20" />

            {section.type === 'text' && (
              <textarea placeholder="본문 내용을 입력하세요" rows={4} value={section.body}
                onChange={(e) => updateSection(si, 'body', e.target.value)}
                className="input-premium resize-none" />
            )}

            {section.type === 'notice' && (
              <div className="bg-amber-50/50 border border-amber-200/40 rounded-xl p-4">
                <textarea placeholder="공지 내용을 입력하세요" rows={3} value={section.body}
                  onChange={(e) => updateSection(si, 'body', e.target.value)}
                  className="w-full bg-transparent border-0 resize-none text-sm
                             focus:outline-none placeholder:text-amber-800/30 text-amber-900" />
              </div>
            )}

            {section.type === 'menu' && (
              <div className="space-y-3">
                {section.items?.map((item, ii) => (
                  <div key={ii} className="flex gap-3 items-start bg-brand-charcoal/[0.02] rounded-xl p-3 border border-amber-900/5">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input placeholder="메뉴명" value={item.name}
                          onChange={(e) => updateItem(si, ii, 'name', e.target.value)}
                          className="input-premium text-sm py-2" />
                        <input placeholder="가격 (예: 15000)" value={item.price || ''} type="number"
                          onChange={(e) => updateItem(si, ii, 'price', e.target.value ? Number(e.target.value) : '')}
                          className="input-premium text-sm py-2" />
                      </div>
                      <input placeholder="설명" value={item.description}
                        onChange={(e) => updateItem(si, ii, 'description', e.target.value)}
                        className="input-premium text-sm py-2" />
                      <div className="flex items-center gap-2">
                        {item.image_url && (
                          <div className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0 border"
                            style={{ backgroundImage: `url(${item.image_url})` }} />
                        )}
                        <label className="text-xs text-brand-charcoal/40 hover:text-brand-charcoal cursor-pointer flex items-center gap-1">
                          <Image size={12} />
                          {item.image_url ? '이미지 변경' : '이미지 추가'}
                          <input type="file" accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file && onImageUpload) onImageUpload(si, ii, file)
                            }}
                            className="hidden" />
                        </label>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(si, ii)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!section.items || section.items.length === 0) && (
                  <p className="text-xs text-brand-charcoal/30 text-center py-4">메뉴 아이템이 없습니다</p>
                )}
                <button type="button" onClick={() => addItem(si)}
                  className="btn-outline text-sm inline-flex items-center gap-1.5 py-1.5 px-3">
                  <Plus size={14} /> 메뉴 아이템 추가
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
