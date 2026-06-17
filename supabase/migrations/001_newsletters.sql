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
