'use client'

import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="text" placeholder="소식지 검색..." value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-stone-400" />
    </div>
  )
}
