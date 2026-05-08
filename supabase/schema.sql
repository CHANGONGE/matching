-- ============================================================
-- 상상우리 매칭 프로젝트 스키마
-- Supabase 프로젝트: cejujszwthlacdgsllzx (ap-northeast-1)
-- 마지막 동기화: 2026-05-08
-- ============================================================

-- ----------------------------------------------------------------
-- 1. seniors
-- ----------------------------------------------------------------
CREATE TABLE public.seniors (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  region       text        NOT NULL,
  desired_job  text        NOT NULL,
  career_years integer     NOT NULL DEFAULT 0,
  created_at   timestamptz          DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. jobs
-- ----------------------------------------------------------------
CREATE TABLE public.jobs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  region           text        NOT NULL,
  job_type         text        NOT NULL,
  required_career  integer     NOT NULL DEFAULT 0,
  created_at       timestamptz          DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. matches
-- ----------------------------------------------------------------
CREATE TABLE public.matches (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id  uuid        NOT NULL REFERENCES public.seniors(id),
  job_id     uuid        NOT NULL REFERENCES public.jobs(id),
  score      numeric     NOT NULL DEFAULT 0,
  status     text        NOT NULL DEFAULT 'pending'
               CHECK (status = ANY (ARRAY['pending', 'assigned', 'done'])),
  created_at timestamptz          DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. 정규화 헬퍼 함수 (비교용, 원본 데이터 수정 없음)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_region(r text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE r
    WHEN '서울특별시' THEN '서울'
    WHEN '경기도'     THEN '경기'
    WHEN '인천광역시' THEN '인천'
    ELSE r
  END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_job(j text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE j
    WHEN '경비직' THEN '경비'
    WHEN '청소직' THEN '청소'
    WHEN '조리직' THEN '조리'
    WHEN '돌봄직' THEN '돌봄'
    ELSE j
  END;
$$;

-- ----------------------------------------------------------------
-- 5. RPC 함수: rematch_senior
--    시니어 1명 × 전체 일자리 점수 재계산
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rematch_senior(p_senior_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_senior public.seniors%ROWTYPE;
BEGIN
  SELECT * INTO v_senior FROM public.seniors WHERE id = p_senior_id;
  IF NOT FOUND THEN RETURN; END IF;

  DELETE FROM public.matches WHERE senior_id = p_senior_id;

  INSERT INTO public.matches (senior_id, job_id, score, status)
  SELECT
    p_senior_id,
    j.id,
    (CASE WHEN normalize_region(v_senior.region)   = normalize_region(j.region)   THEN 3 ELSE 0 END) +
    (CASE WHEN normalize_job(v_senior.desired_job) = normalize_job(j.job_type)    THEN 2 ELSE 0 END) +
    (CASE WHEN v_senior.career_years >= j.required_career                         THEN 1 ELSE 0 END),
    'pending'
  FROM public.jobs j;
END;
$$;

-- ----------------------------------------------------------------
-- 6. RPC 함수: rematch_job
--    일자리 1건 × 전체 시니어 점수 재계산
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rematch_job(p_job_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_job public.jobs%ROWTYPE;
BEGIN
  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;
  IF NOT FOUND THEN RETURN; END IF;

  DELETE FROM public.matches WHERE job_id = p_job_id;

  INSERT INTO public.matches (senior_id, job_id, score, status)
  SELECT
    s.id,
    p_job_id,
    (CASE WHEN normalize_region(s.region)   = normalize_region(v_job.region)   THEN 3 ELSE 0 END) +
    (CASE WHEN normalize_job(s.desired_job) = normalize_job(v_job.job_type)    THEN 2 ELSE 0 END) +
    (CASE WHEN s.career_years >= v_job.required_career                         THEN 1 ELSE 0 END),
    'pending'
  FROM public.seniors s;
END;
$$;

-- ----------------------------------------------------------------
-- 매칭 점수 규칙 (최대 6점)
--   지역 일치   → +3  (정규화 후 비교)
--   직종 일치   → +2  (정규화 후 비교)
--   경력 충족   → +1
-- ----------------------------------------------------------------

-- ⚠️  RLS 비활성화 상태 (학습 환경 전용)
-- 실서비스 전환 시 아래 구문 실행 후 정책 추가 필요:
--   ALTER TABLE public.seniors ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.jobs    ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
