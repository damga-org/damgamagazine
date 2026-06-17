'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import NewsletterForm from '@/components/NewsletterForm'
import { Newspaper } from 'lucide-react'

export default function EditNewsletterPage() {
  const { id } = useParams()
  const [newsletter, setNewsletter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabase().from('newsletters').select('*').eq('id', id).single()
      .then(({ data }) => {
        setNewsletter(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-amber-900/10 rounded w-48" />
        <div className="h-64 bg-amber-900/5 rounded-2xl" />
        <div className="h-48 bg-amber-900/5 rounded-2xl" />
      </div>
    </div>
  )
  if (!newsletter) return (
    <div className="max-w-3xl mx-auto p-6 text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
        <Newspaper size={28} className="text-brand-amber" />
      </div>
      <p className="text-brand-charcoal/50 font-medium">소식지를 찾을 수 없습니다</p>
    </div>
  )

  return <NewsletterForm newsletter={newsletter} />
}
