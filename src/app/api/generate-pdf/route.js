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
    const cookieStore = await cookies()
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
