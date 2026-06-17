import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { Document, Page, Image } from '@react-pdf/renderer'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function NewsletterPDF({ newsletter }) {
  const pages = newsletter.content?.pages || []
  return (
    <Document>
      {pages.map((page, i) => (
        <Page key={i} size="A4">
          <Image src={page.image_url} style={{ width: '100%', height: '100%' }} />
        </Page>
      ))}
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
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // 읽기 전용 라우트 — 쿠키 설정 불필요
          },
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 소식지 데이터 조회
    const { data: newsletter, error: fetchError } = await getSupabaseAdmin()
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
    const { error: uploadError } = await getSupabaseAdmin().storage
      .from('newsletter-assets')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = getSupabaseAdmin().storage
      .from('newsletter-assets')
      .getPublicUrl(fileName)

    // newsletters 테이블에 pdf_url 업데이트
    await getSupabaseAdmin()
      .from('newsletters')
      .update({ pdf_url: publicUrl })
      .eq('id', id)

    return NextResponse.json({ pdf_url: publicUrl })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
