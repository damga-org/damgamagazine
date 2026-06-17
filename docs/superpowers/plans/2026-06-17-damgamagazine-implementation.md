# 담가화로구이 가맹점 소식지 웹앱 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 담가화로구이 가맹점주를 위한 월간 소식지 웹앱 구축 (관리자 CMS + 공개 뷰어 + PDF 내보내기)

**Architecture:** Next.js SPA + Supabase (Auth, PostgreSQL, Storage). 공개 영역은 계정 없이 접근 가능, 관리자 영역은 Supabase Auth 로그인 필요. PDF는 발행 시 서버에서 자동 생성 후 Supabase Storage에 저장.

**Tech Stack:** Next.js 15 (App Router), Supabase, @react-pdf/renderer, Tailwind CSS

---

## Task 1: 프로젝트 초기화

**Files:**
- Create: `package.json` (via npm create next-app)
- Create: `.env.local.example`
- Create: `.gitignore`
- Modify: `next.config.js`

- [ ] **1-1: Next.js 프로젝트 생성 + 의존성 설치**

```bash
npx create-next-app@latest . --js --tailwind --eslint --app --src-dir --no-turbopack --import-alias "@/*"
npm install @supabase/supabase-js @supabase/ssr @react-pdf/renderer lucide-react
```

- [ ] **1-2: .env.local.example 작성**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **1-3: next.config.js 수정 — 이미지 도메인 허용**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

- [ ] **1-4: .gitignore에 .superpowers 추가**

`/.superpowers` 줄을 `.gitignore`에 추가

---

## Task 2: 데이터베이스 스키마 (Supabase SQL)

**Files:**
- Create: `supabase/migrations/001_newsletters.sql`

- [ ] **2-1: newsletters 테이블 + tsvector + RLS SQL 작성**

```sql
-- supabase/migrations/001_newsletters.sql

-- newsletters 테이블
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issue_month DATE NOT NULL,
  content JSONB NOT NULL DEFAULT '{"sections": []}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  cover_image TEXT,
  pdf_url TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- tsvector 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION newsletters_search_update()
RETURNS TRIGGER AS $$
DECLARE
  section_body TEXT;
BEGIN
  section_body := '';
  SELECT string_agg(
    COALESCE(value->>'title', '') || ' ' ||
    COALESCE(value->>'body', '') || ' ' ||
    COALESCE(
      (SELECT string_agg(COALESCE(item->>'name', '') || ' ' || COALESCE(item->>'description', ''), ' ')
       FROM jsonb_array_elements(value->'items') AS item),
      ''),
    ' ')
  INTO section_body
  FROM jsonb_array_elements(NEW.content->'sections') AS value;

  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.title, '') || ' ' || COALESCE(section_body, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_newsletters_search
  BEFORE INSERT OR UPDATE OF title, content ON newsletters
  FOR EACH ROW EXECUTE FUNCTION newsletters_search_update();

-- 인덱스
CREATE INDEX idx_newsletters_published_at ON newsletters (published_at DESC);
CREATE INDEX idx_newsletters_search_vector ON newsletters USING GIN (search_vector);
CREATE INDEX idx_newsletters_status ON newsletters (status);

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 활성화
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- 공개 SELECT (published 만)
CREATE POLICY "Anyone can view published newsletters"
  ON newsletters FOR SELECT
  USING (status = 'published');

-- 인증된 사용자만 모든 레코드 읽기/쓰기 가능
CREATE POLICY "Authenticated users can view all newsletters"
  ON newsletters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert newsletters"
  ON newsletters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update newsletters"
  ON newsletters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete newsletters"
  ON newsletters FOR DELETE
  TO authenticated
  USING (true);
```

- [ ] **2-2: Supabase Storage 버킷 생성**

SQL Editor에서 실행:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('newsletter-assets', 'newsletter-assets', true);
```

Storage RLS:
```sql
-- 이미지/PDF 업로드는 인증 필요
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'newsletter-assets');

-- 다운로드는 누구나
CREATE POLICY "Anyone can download"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'newsletter-assets');
```

---

## Task 3: Supabase 클라이언트 라이브러리

**Files:**
- Create: `src/lib/supabase.js`

- [ ] **3-1: Supabase 클라이언트 생성**

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **3-2: 서비스 롤 클라이언트 (API Route 전용)**

```javascript
// src/lib/supabase-admin.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
```

---

## Task 4: Auth 컨텍스트 + 관리자 로그인

**Files:**
- Create: `src/context/AuthContext.jsx`
- Create: `src/app/admin/login/page.jsx`
- Create: `src/components/AuthGuard.jsx`

- [ ] **4-1: AuthContext — 세션 관리**

```javascript
// src/context/AuthContext.jsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading, user: session?.user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

- [ ] **4-2: 관리자 로그인 페이지**

```javascript
// src/app/admin/login/page.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-bold text-center">관리자 로그인</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email" placeholder="이메일" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="password" placeholder="비밀번호" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2"
        />
        <button type="submit" disabled={loading}
          className="w-full bg-stone-800 text-white rounded-lg py-2 hover:bg-stone-700 disabled:opacity-50">
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **4-3: AuthGuard 컴포넌트**

```javascript
// src/components/AuthGuard.jsx
'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/admin/login')
    }
  }, [session, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
```

---

## Task 5: 루트 레이아웃 + 관리자 레이아웃

**Files:**
- Modify: `src/app/layout.jsx`
- Modify: `src/app/globals.css`
- Create: `src/app/admin/layout.jsx`

- [ ] **5-1: Root layout에 AuthProvider 추가**

```javascript
// src/app/layout.jsx
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata = {
  title: '담가화로구이 소식지',
  description: '담가화로구이 가맹점 소식지',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-[#FAF8F5] text-[#2D2926]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] **5-2: globals.css — Tailwind + 기본 스타일**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}
```

- [ ] **5-3: Admin layout — AuthGuard로 감싸기**

```javascript
// src/app/admin/layout.jsx
import AuthGuard from '@/components/AuthGuard'

export const metadata = {
  title: '담가화로구이 소식지 관리',
}

export default function AdminLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>
}
```

---

## Task 6: 관리자 대시보드

**Files:**
- Create: `src/app/admin/page.jsx`

- [ ] **6-1: 대시보드 — 소식지 목록 + 발행/미발행 필터**

```javascript
// src/app/admin/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
    const { data } = await supabase
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
      await supabase.from('newsletters').update({
        status: 'published',
        published_at: new Date().toISOString(),
      }).eq('id', id)
      loadNewsletters()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('newsletters').delete().eq('id', id)
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
```

---

## Task 7: 에디터 컴포넌트 (SectionEditor + NewsletterForm)

**Files:**
- Create: `src/components/SectionEditor.jsx`
- Create: `src/components/NewsletterForm.jsx`

- [ ] **7-1: SectionEditor — 타입별 섹션 추가/수정/삭제/순서변경**

```javascript
// src/components/SectionEditor.jsx
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
```

- [ ] **7-2: NewsletterForm — 제목/발행월/커버이미지/섹션**

```javascript
// src/components/NewsletterForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SectionEditor from './SectionEditor'
import { Save, Send } from 'lucide-react'

export default function NewsletterForm({ newsletter = null }) {
  const [title, setTitle] = useState(newsletter?.title || '')
  const [issueMonth, setIssueMonth] = useState(newsletter?.issue_month?.slice(0, 7) || '')
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(newsletter?.cover_image || '')
  const [sections, setSections] = useState(newsletter?.content?.sections || [])
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleSave = async (status) => {
    setSaving(true)

    let coverImageUrl = newsletter?.cover_image || ''

    if (coverImage) {
      const fileExt = coverImage.name.split('.').pop()
      const fileName = `covers/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('newsletter-assets')
        .upload(fileName, coverImage)
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('newsletter-assets')
          .getPublicUrl(fileName)
        coverImageUrl = publicUrl
      }
    }

    const payload = {
      title,
      issue_month: issueMonth ? `${issueMonth}-01` : null,
      content: { sections },
      cover_image: coverImageUrl,
      status,
    }

    if (newsletter?.id) {
      await supabase.from('newsletters').update(payload).eq('id', newsletter.id)
    } else {
      await supabase.from('newsletters').insert(payload)
    }

    setSaving(false)
    router.push('/admin')
    router.refresh()
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{newsletter ? '소식지 수정' : '새 소식지 작성'}</h1>

      <div className="space-y-4">
        <input placeholder="소식지 제목 (예: 2026년 6월호)" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400" />

        <div>
          <label className="block text-sm text-gray-500 mb-1">발행월</label>
          <input type="month" value={issueMonth} onChange={(e) => setIssueMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-stone-400" />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">커버 이미지</label>
          {coverPreview && <img src={coverPreview} alt="cover" className="w-40 h-28 object-cover rounded-lg mb-2" />}
          <input type="file" accept="image/*" onChange={handleImageUpload}
            className="text-sm" />
        </div>

        <SectionEditor sections={sections} onChange={setSections} />
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={() => handleSave('draft')} disabled={saving || !title}
          className="flex items-center gap-2 px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <Save size={18} /> 초안 저장
        </button>
        <button onClick={() => handleSave('published')} disabled={saving || !title}
          className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50">
          <Send size={18} /> {saving ? '저장 중...' : '발행'}
        </button>
      </div>
    </div>
  )
}
```

---

## Task 8: 생성/수정 페이지

**Files:**
- Create: `src/app/admin/new/page.jsx`
- Create: `src/app/admin/edit/[id]/page.jsx`

- [ ] **8-1: 새 소식지 작성 페이지**

```javascript
// src/app/admin/new/page.jsx
'use client'

import NewsletterForm from '@/components/NewsletterForm'

export default function NewNewsletterPage() {
  return <NewsletterForm />
}
```

- [ ] **8-2: 소식지 수정 페이지**

```javascript
// src/app/admin/edit/[id]/page.jsx
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
```

---

## Task 9: PDF 생성 API Route

**Files:**
- Create: `src/app/api/generate-pdf/route.js`

- [ ] **9-1: @react-pdf/renderer 기반 PDF 생성 API**

```javascript
// src/app/api/generate-pdf/route.js
import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  title: { fontSize: 24, marginBottom: 8, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#666', marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  body: { fontSize: 11, lineHeight: 1.6, marginBottom: 12 },
  menuItem: { marginBottom: 8, paddingLeft: 8 },
  menuName: { fontSize: 13, fontWeight: 'bold' },
  menuDesc: { fontSize: 10, color: '#555' },
  image: { width: 200, height: 120, objectFit: 'cover', marginVertical: 8 },
  noticeBox: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 12 },
})

function NewsletterPDF({ newsletter }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{newsletter.title}</Text>
        <Text style={styles.date}>{newsletter.issue_month}</Text>

        {newsletter.cover_image && (
          <Image style={styles.image} src={newsletter.cover_image} />
        )}

        {(newsletter.content?.sections || []).map((section, i) => (
          <View key={i}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}

            {section.type === 'text' && (
              <Text style={styles.body}>{section.body}</Text>
            )}

            {section.type === 'notice' && (
              <View style={styles.noticeBox}>
                <Text style={styles.body}>{section.body}</Text>
              </View>
            )}

            {section.type === 'menu' && section.items?.map((item, ii) => (
              <View key={ii} style={styles.menuItem}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export async function POST(request) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // 세션 확인
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 소식지 데이터 조회
    const { data: newsletter, error: fetchError } = await supabaseAdmin
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // PDF 생성
    const stream = await renderToStream(<NewsletterPDF newsletter={newsletter} />)
    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const pdfBuffer = Buffer.concat(chunks)

    // Supabase Storage에 업로드
    const fileName = `pdfs/${id}.pdf`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('newsletter-assets')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('newsletter-assets')
      .getPublicUrl(fileName)

    // newsletters 테이블에 pdf_url 업데이트
    await supabaseAdmin
      .from('newsletters')
      .update({ pdf_url: publicUrl })
      .eq('id', id)

    return NextResponse.json({ pdf_url: publicUrl })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Task 10: 공개 컴포넌트 (NewsletterCard, SearchBar, SectionRenderer)

**Files:**
- Create: `src/components/NewsletterCard.jsx`
- Create: `src/components/SearchBar.jsx`
- Create: `src/components/SectionRenderer.jsx`

- [ ] **10-1: NewsletterCard — 소식지 카드 컴포넌트**

```javascript
// src/components/NewsletterCard.jsx
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
```

- [ ] **10-2: SearchBar — 검색 입력 컴포넌트**

```javascript
// src/components/SearchBar.jsx
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
```

- [ ] **10-3: SectionRenderer — 섹션 타입별 뷰어**

```javascript
// src/components/SectionRenderer.jsx
export default function SectionRenderer({ section }) {
  switch (section.type) {
    case 'text':
      return (
        <div className="space-y-2">
          {section.title && <h3 className="text-xl font-bold">{section.title}</h3>}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.body}</p>
        </div>
      )

    case 'notice':
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          {section.title && <h3 className="font-bold text-amber-900">{section.title}</h3>}
          <p className="text-amber-800 whitespace-pre-line">{section.body}</p>
        </div>
      )

    case 'menu':
      return (
        <div className="space-y-3">
          {section.title && <h3 className="text-xl font-bold">{section.title}</h3>}
          <div className="grid gap-3">
            {section.items?.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-xl p-4 border">
                {item.image_url && (
                  <div className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${item.image_url})` }} />
                )}
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}
```

---

## Task 11: 공개 페이지 — 소식지 목록

**Files:**
- Modify: `src/app/page.jsx`

- [ ] **11-1: 홈페이지 — 소식지 목록 + 검색 (Supabase tsvector)**

```javascript
// src/app/page.jsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import NewsletterCard from '@/components/NewsletterCard'
import SearchBar from '@/components/SearchBar'

export default function HomePage() {
  const [newsletters, setNewsletters] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadNewsletters = useCallback(async (query) => {
    setLoading(true)

    let queryBuilder = supabase
      .from('newsletters')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (query?.trim()) {
      queryBuilder = supabase
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
```

---

## Task 12: 공개 페이지 — 소식지 상세

**Files:**
- Create: `src/app/newsletter/[id]/page.jsx`

- [ ] **12-1: 소식지 상세 페이지 + PDF 다운로드**

```javascript
// src/app/newsletter/[id]/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SectionRenderer from '@/components/SectionRenderer'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'

export default function NewsletterDetailPage() {
  const { id } = useParams()
  const [newsletter, setNewsletter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('newsletters').select('*').eq('id', id).eq('status', 'published').single()
      .then(({ data }) => {
        setNewsletter(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">소식지를 찾을 수 없습니다</p>
        <Link href="/" className="text-stone-600 underline">목록으로</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-stone-800 mb-6">
          <ArrowLeft size={16} /> 목록으로
        </Link>

        {newsletter.cover_image && (
          <div className="w-full h-56 rounded-2xl bg-cover bg-center mb-6"
            style={{ backgroundImage: `url(${newsletter.cover_image})` }} />
        )}

        <h1 className="text-3xl font-bold mb-2">{newsletter.title}</h1>
        <p className="text-gray-500 mb-8">
          {new Date(newsletter.issue_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </p>

        <div className="space-y-8 mb-8">
          {newsletter.content?.sections?.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>

        {newsletter.pdf_url && (
          <a href={newsletter.pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors">
            <Download size={18} /> PDF 다운로드
          </a>
        )}
      </div>
    </main>
  )
}
```

---

## Task 13: 마무리 — 환경설정 + 배포

**Files:**
- Modify: `.gitignore`
- Verify: 전체 빌드 테스트

- [ ] **13-1: .gitignore 확인**

`.gitignore`에 다음 항목이 있는지 확인:
```
.env.local
.next/
node_modules/
/.superpowers/
```

- [ ] **13-2: 로컬 빌드 테스트**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **13-3: 최초 커밋**

```bash
git add .
git commit -m "feat: initial project setup with Next.js + Supabase"
```

---

## Spec Coverage 확인

| Spec 요구사항 | 구현 Task |
|---|---|
| 소식지 CRUD (관리자) | Task 6 (대시보드), Task 7~8 (에디터/생성/수정) |
| 공개 소식지 목록 + 검색 | Task 11 (홈페이지), Task 10 (SearchBar) |
| 소식지 상세 + PDF 다운로드 | Task 12 (상세 페이지) |
| PDF 자동 생성 | Task 9 (API Route) |
| Supabase Auth 로그인 | Task 4 (AuthContext, login, AuthGuard) |
| RLS 보안 | Task 2 (SQL migration) |
| tsvector 전문 검색 | Task 2 (SQL trigger + index), Task 11 (textSearch) |
| Supabase Storage (이미지/PDF) | Task 2 (Storage bucket), Task 7 (이미지 업로드), Task 9 (PDF 업로드) |
