# 담가화로구이 가맹점 소식지 웹앱 — 디자인 명세

## 개요

누룩숙성 프리미엄 소고기 화로구이 외식프랜차이즈 **담가화로구이**의 가맹점주를 위한 월간 소식지 웹앱. 관리자(본사)는 소식지를 작성/발행하고, 가맹점주 및 일반 방문자는 발행된 소식지를 검색/열람/PDF 다운로드할 수 있다.

## 기술 스택

| 계층 | 기술 |
|---|---|
| 프론트엔드 | Next.js (SPA 모드, `static export` 또는 `client-only`) |
| 백엔드 | Supabase (BaaS) |
| 인증 | Supabase Auth (이메일/비밀번호, 관리자 전용) |
| 데이터베이스 | Supabase PostgreSQL (전문 검색: `tsvector`) |
| 스토리지 | Supabase Storage (커버 이미지, PDF 파일) |
| PDF 생성 | Vercel API Route + `@react-pdf/renderer` 또는 Supabase Edge Function |
| 배포 | Vercel (무료 티어) |

## 아키텍처

```
Next.js App (SPA)
│
├── / (공개 영역)
│   ├── 소식지 목록 (검색 + 월별 정렬)
│   ├── 소식지 상세 (섹션별 렌더링 + PDF 다운로드)
│   └── 404/에러 페이지
│
├── /admin (관리자, Supabase Auth 로그인 필요)
│   ├── 로그인 페이지
│   ├── 대시보드 (초안/발행 목록)
│   ├── 소식지 작성 에디터
│   └── 소식지 수정 에디터
│
└── API Routes (Vercel)
    └── PDF 생성 및 Supabase Storage 업로드
```

## 데이터 모델

### `newsletters` 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | `uuid` PK, `default gen_random_uuid()` | |
| `title` | `text` NOT NULL | 소식지 제목 (예: "2026년 6월호") |
| `issue_month` | `date` NOT NULL | 발행 연월 (매월 1일) |
| `content` | `jsonb` NOT NULL | 본문 구조화 데이터 |
| `status` | `text` NOT NULL DEFAULT `'draft'` | `draft` / `published` |
| `cover_image` | `text` | Supabase Storage URL |
| `pdf_url` | `text` | Supabase Storage URL |
| `search_vector` | `tsvector` | 제목 + content 본문 전문 검색 인덱스 |
| `created_at` | `timestamptz` DEFAULT `now()` |
| `updated_at` | `timestamptz` DEFAULT `now()` |
| `published_at` | `timestamptz` |

### content (jsonb) 구조

```json
{
  "sections": [
    {
      "type": "text",
      "title": "이달의 소식",
      "body": "본문 내용..."
    },
    {
      "type": "menu",
      "title": "신메뉴 안내",
      "items": [
        {
          "name": "메뉴명",
          "description": "설명",
          "image_url": "https://..."
        }
      ]
    },
    {
      "type": "notice",
      "title": "본사 공지",
      "body": "공지 내용..."
    }
  ]
}
```

### Indexes

- `idx_newsletters_published_at` — 발행일 기준 정렬
- `idx_newsletters_search_vector` — GIN index for `tsvector` 전문 검색
- `idx_newsletters_status` — 발행/초안 필터

## 화면 구성

### 공개 영역

| 경로 | 설명 |
|---|---|
| `/` | 소식지 목록. 카드 그리드 + 상단 검색바. `status = 'published'` 만 표시. 최신순 정렬. |
| `/newsletter/[id]` | 소식지 상세. 제목/발행일/커버 이미지/섹션별 렌더링. 하단 "PDF 다운로드" 버튼. |

### 관리자 영역

| 경로 | 설명 |
|---|---|
| `/admin/login` | Supabase Auth 로그인 폼 (이메일/비밀번호). 로그인 시 `/admin` 리다이렉트. |
| `/admin` | 대시보드. 모든 소식지 목록 (초안/발행), 상태별 필터, "새 소식지 작성" 버튼. |
| `/admin/new` | 소식지 작성 에디터. |
| `/admin/edit/[id]` | 기존 소식지 수정. |

### 관리자 에디터 기능

- 제목 입력
- 발행월 선택 (date picker)
- 섹션 추가/삭제/순서 변경 (drag & drop)
- 섹션 타입 선택: 텍스트, 메뉴 아이템 목록, 공지
- 커버 이미지 업로드 (Supabase Storage, 드래그 앤 드롭)
- **"초안 저장"** 버튼 — DB 저장, `status = 'draft'`
- **"발행"** 버튼 — `status = 'published'`, `published_at` 설정, PDF 자동 생성
- **"PDF 미리보기"** 버튼 (선택사항)

## PDF 생성

- 발행 버튼 클릭 시 API Route (`/api/generate-pdf`) 호출
- 서버에서 content jsonb 기반 PDF 생성 (`@react-pdf/renderer`)
- 생성된 PDF → Supabase Storage 업로드
- `newsletters.pdf_url` 컬럼에 저장

## 검색

- Supabase `tsvector` 전문 검색 사용
- 검색 대상: `title` + 모든 섹션의 `body`, `title`, `items[].name`, `items[].description`
- 검색 결과: 관련도 순 정렬, 검색어 하이라이트 (선택사항)

## 보안

- Supabase Row Level Security (RLS) 적용
- `newsletters` 테이블: SELECT는 모두 허용, INSERT/UPDATE/DELETE는 `auth.role() = 'authenticated'` 만 허용
- Storage: cover_image 업로드는 인증 필요, 다운로드는 모두 허용
- PDF 파일도 동일 정책

## 배포

- Vercel: GitHub 연결 → 자동 배포
- 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `.env.local` — 로컬 개발용
