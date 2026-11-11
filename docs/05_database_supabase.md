# docs/05_database_supabase.md - Supabase DB 설계 및 연동 지침

## 1. 개요
분석된 감성 결과 데이터 및 텍스트 로그를 Supabase PostgreSQL 데이터베이스에 저장하기 위한 스키마 설계 및 백엔드 연동 지침입니다.

## 2. 데이터베이스 테이블 스키마 (`sentiment_logs`)

```sql
CREATE TABLE sentiment_logs (
    id BIGSERIAL PRIMARY KEY,
    input_text TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL,
    confidence INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 백엔드 Supabase 클라이언트 연동 규칙
1. `@supabase/supabase-js` 라이브러리를 사용하여 서버 측에서 데이터 삽입 수행.
2. AI 분석 성공 직후 `sentiment_logs` 테이블에 `insert` 쿼리 실행.
3. DB 저장에 실패하더라도 사용자 분석 결과 반환이 완전히 차단되지 않도록 비동기 이외 예외 처리 코드를 포함하되, 오류 로그를 남길 것.

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] Supabase 대시보드의 `sentiment_logs` 테이블에 입력 텍스트, 감성 결과, 신뢰도, 이유, 생성 일시가 정확히 저장되는가?
* [ ] RLS (Row Level Security) 또는 Anon Key 권한 설정이 올바르게 구성되어 읽기/쓰기가 동작하는가?
