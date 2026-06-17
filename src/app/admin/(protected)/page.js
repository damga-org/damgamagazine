'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Plus, Edit, FileText, Trash2 } from 'lucide-react'

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
    if (res.ok) {
      await getSupabase().from('newsletters').update({
        status: 'published',
        published_at: new Date().toISOString(),
      }).eq('id', id)
      loadNewsletters()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await getSupabase().from('newsletters').delete().eq('id', id)
    loadNewsletters()
  }

  const filtered = filter === 'all'
    ? newsletters
    : newsletters.filter(n => n.status === filter)

  if (loading) return <div className="p-8 text-center">로딩 중...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">소식지 관리</h1>
        <button onClick={() => router.push('/admin/new')}
          className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700">
          <Plus size={18} /> 새 소식지
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'draft', 'published'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${filter === f ? 'bg-stone-800 text-white' : 'bg-gray-200'}`}>
            {f === 'all' ? '전체' : f === 'draft' ? '초안' : '발행됨'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((nl) => (
          <div key={nl.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
            <div>
              <h3 className="font-semibold">{nl.title}</h3>
              <p className="text-sm text-gray-500">
                {nl.issue_month} · {nl.status === 'published' ? '발행 완료' : '초안'}
                {nl.published_at && ` · ${new Date(nl.published_at).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push(`/admin/edit/${nl.id}`)}
                className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={18} /></button>
              {nl.status === 'draft' && (
                <button onClick={() => handlePublish(nl.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"><FileText size={18} /></button>
              )}
              <button onClick={() => handleDelete(nl.id)}
                className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8">소식지가 없습니다</p>}
      </div>
    </div>
  )
}
