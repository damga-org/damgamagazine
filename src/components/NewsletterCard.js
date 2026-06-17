'use client'

import { useRouter } from 'next/navigation'
import { Newspaper, ChevronRight } from 'lucide-react'

export default function NewsletterCard({ newsletter }) {
  const router = useRouter()
  const firstPage = newsletter.content?.pages?.[0]?.image_url

  return (
    <div onClick={() => router.push(`/newsletter/${newsletter.id}`)}
      className="card-premium group cursor-pointer overflow-hidden">
      <div className="relative overflow-hidden">
        {firstPage ? (
          <div className="h-44 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${firstPage})` }} />
        ) : (
          <div className="h-44 bg-gradient-to-br from-brand-charcoal/5 to-brand-amber/5 flex items-center justify-center">
            <Newspaper size={40} className="text-brand-amber/30" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="badge-published">발행 완료</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-brand-charcoal group-hover:text-brand-warm transition-colors">
          {newsletter.title}
        </h3>
        <p className="text-sm text-brand-charcoal/40 mt-1.5 font-medium">
          {new Date(newsletter.issue_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </p>
        <p className="text-sm text-brand-charcoal/60 mt-3 leading-relaxed">
          {(newsletter.content?.pages?.length || 0)}페이지
        </p>
        <div className="mt-4 pt-3 border-t border-amber-900/5 flex items-center justify-between">
          <span className="text-xs text-brand-charcoal/30">자세히 보기</span>
          <ChevronRight size={14} className="text-brand-amber group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  )
}
