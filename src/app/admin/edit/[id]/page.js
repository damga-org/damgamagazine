'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NewsletterForm from '@/components/NewsletterForm'

export default function EditNewsletterPage() {
  const { id } = useParams()
  const [newsletter, setNewsletter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('newsletters').select('*').eq('id', id).single()
      .then(({ data }) => {
        setNewsletter(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="p-8 text-center">로딩 중...</div>
  if (!newsletter) return <div className="p-8 text-center">소식지를 찾을 수 없습니다</div>

  return <NewsletterForm newsletter={newsletter} />
}
