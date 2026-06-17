'use client'

import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative group">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/25 group-focus-within:text-brand-amber transition-colors" />
      <input type="text" placeholder="소식지 검색..." value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-premium pl-12 pr-4 shadow-lg shadow-amber-900/5" />
    </div>
  )
}
