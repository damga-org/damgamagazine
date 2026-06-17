'use client'

import { useRouter } from 'next/navigation'

export default function NewsletterCard({ newsletter }) {
  const router = useRouter()

  return (
    <div onClick={() => router.push(`/newsletter/${newsletter.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
      {newsletter.cover_image ? (
        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${newsletter.cover_image})` }} />
      ) : (
        <div className="h-40 bg-stone-100 flex items-center justify-center text-stone-400">담가화로구이</div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg">{newsletter.title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(newsletter.issue_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </p>
        <p className="text-xs text-stone-400 mt-2 line-clamp-2">
          {newsletter.content?.sections?.[0]?.body?.slice(0, 80)}
        </p>
      </div>
    </div>
  )
}
