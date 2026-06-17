'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import NewsletterCard from '@/components/NewsletterCard'
import SearchBar from '@/components/SearchBar'

export default function HomePage() {
  const [newsletters, setNewsletters] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadNewsletters = useCallback(async (query) => {
    setLoading(true)

    let queryBuilder = getSupabase()
      .from('newsletters')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (query?.trim()) {
      queryBuilder = getSupabase()
        .from('newsletters')
        .select('*')
        .eq('status', 'published')
        .textSearch('search_vector', query.trim().split(/\s+/).join(' & '), {
          type: 'websearch',
          config: 'simple',
        })
        .order('published_at', { ascending: false })
    }

    const { data } = await queryBuilder
    setNewsletters(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadNewsletters(search), 300)
    return () => clearTimeout(timer)
  }, [search, loadNewsletters])

  return (
    <main className="min-h-screen">
      <header className="bg-stone-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold">담가화로구이 소식지</h1>
          <p className="text-stone-300 mt-2">가맹점주를 위한 월간 소식</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 -mt-6 mb-8">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="text-center py-12 text-gray-400">로딩 중...</div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {search ? '검색 결과가 없습니다' : '발행된 소식지가 없습니다'}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsletters.map((nl) => (
              <NewsletterCard key={nl.id} newsletter={nl} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
