-- ==============================================================================
-- 파일명: 001_create_sentiment_logs_table.sql
-- 설명: 감성 분석 결과 이력을 저장하기 위한 Supabase PostgreSQL 테이블 생성 및 보안 정책 스크립트
-- 작성일: 2026-11-10
-- ==============================================================================

-- 1. 기존 테이블이 존재할 경우 대비 (초기화 필요 시에만 안전하게 확인)
-- 주의: 기존 데이터 보존을 위해 DROP 문은 주석 처리합니다. 필요 시 주석을 해제하세요.
-- DROP TABLE IF EXISTS public.sentiment_logs;

-- 2. sentiment_logs (감성 분석 로그) 테이블 생성
CREATE TABLE IF NOT EXISTS public.sentiment_logs (
    -- id: 각 분석 기록의 고유 식별 번호 (1씩 자동 증가하는 기본키)
    id BIGSERIAL PRIMARY KEY,

    -- input_text: 사용자가 분석을 요청한 원본 입력 텍스트 (빈 값 불가)
    input_text TEXT NOT NULL,

    -- sentiment: AI가 분석한 감성 결과 ('긍정', '부정', '중립' 중 하나, 빈 값 불가)
    sentiment VARCHAR(20) NOT NULL,

    -- confidence: AI 분석 신뢰도 백분율 (0 ~ 100 사이의 정수 값)
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),

    -- reason: AI가 해당 감성으로 판별한 구체적인 논리적 근거 (2~3문장)
    reason TEXT NOT NULL,

    -- created_at: 분석 데이터가 생성된 일시 (기본값: 현재 타임스탬프, UTC 기준)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. 테이블 및 컬럼 설명(Comment) 추가 (관리 및 가독성 향상)
COMMENT ON TABLE public.sentiment_logs IS '감성 텍스트 분석 결과 로그 테이블';
COMMENT ON COLUMN public.sentiment_logs.id IS '기록 고유 식별자(PK)';
COMMENT ON COLUMN public.sentiment_logs.input_text IS '사용자가 입력한 분석 대상 문장';
COMMENT ON COLUMN public.sentiment_logs.sentiment IS '감성 분석 결과 (긍정, 부정, 중립)';
COMMENT ON COLUMN public.sentiment_logs.confidence IS '분석 결과 신뢰도 (0~100%)';
COMMENT ON COLUMN public.sentiment_logs.reason IS 'AI 분석 판단 이유';
COMMENT ON COLUMN public.sentiment_logs.created_at IS '데이터 생성 일시';

-- 4. 성능 최적화를 위한 인덱스 생성
-- 최근 분석 기록 조회(ORDER BY created_at DESC) 성능을 높이기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_created_at 
ON public.sentiment_logs (created_at DESC);

-- 특정 감성(긍정/부정/중립) 통계 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_sentiment 
ON public.sentiment_logs (sentiment);

-- 5. 보안 설정 (Row Level Security - RLS 활성화)
-- Supabase에서는 데이터 무단 변조를 막기 위해 RLS 활성화를 권장합니다.
ALTER TABLE public.sentiment_logs ENABLE ROW LEVEL SECURITY;

-- 정책 1: 누구나(익명 사용자 포함) 새로운 분석 결과를 등록(INSERT)할 수 있도록 허용
CREATE POLICY "Allow anonymous insert for sentiment logs"
ON public.sentiment_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 정책 2: 분석 이력 조회(SELECT) 허용 정책
CREATE POLICY "Allow read access for sentiment logs"
ON public.sentiment_logs
FOR SELECT
TO anon, authenticated
USING (true);

