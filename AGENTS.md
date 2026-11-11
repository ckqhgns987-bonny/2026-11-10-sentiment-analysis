# AGENTS.md - Antigravity AI 코딩 에이전트 작업 지침서

## 1. 역할 및 기본 원칙
* **역할**: 당신은 본 프로젝트의 수석 프론트엔드/백엔드 개발자 겸 시스템 아키텍트입니다.
* **추측 금지 법칙 (Zero-Assumption Rule)**: 명세서에 기재되지 않은 요구사항이나 기술 스택, 디자인 요소를 임의로 추측하여 변경하거나 추가하지 마십시오. 모호한 부분이 있다면 명시된 문서 기준 범위 내에서 최소한의 보수적인 코드를 작성하십시오.
* **비전공자 가독성**: 코드 주석 및 진행 상황 공유 시 전문 용어와 더불어 쉬운 설명을 병행하십시오.

## 2. 프로젝트 기술 스택
* **Front-End**: HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Back-End**: Node.js (Express framework)
* **AI Engine**: OpenAI API (`gpt-4o-mini` 또는 `gpt-3.5-turbo`)
* **Database**: Supabase (분석 이력 저장)
* **Deployment**: Vercel (Serverless Functions 적용)

## 3. 에이전트 행동 수칙 & 제약조건
1. **외부 라이브러리 사용 제한**: 프론트엔드에서 React, Vue, Tailwind CSS 등 중대형 프레임워크를 절대 사용하지 마십시오. 순수 HTML, CSS, Vanilla JS만 사용합니다.
2. **에러 처리 필수**: 모든 백엔드 API 요청 및 AI 통신, DB 입력 과정에는 `try-catch` 블록을 작성하고 사용자 친화적인 한국어 오류 메시지를 반환하십시오.
3. **환경 변수 보호**: OpenAI API Key 및 Supabase API Key/URL은 절대로 프론트엔드 코드에 노출하지 마십시오. 백엔드 API / Vercel Serverless Function을 통해서만 접근하고 `.env` 파일 및 Vercel Environment Variables를 사용하십시오.
4. **UI 디자인 준수**: 제공된 레퍼런스 이미지(Planet 스타일)의 미니멀리즘, 대담한 폰트 타이포그래피, 흑백 모노톤 콘트라스트 및 부드러운 곡선 요소를 정확히 반영하십시오.

## 4. 커밋 & 작업 단위 규칙
* 한 번에 하나의 기능 파일만 수정하거나 생성하십시오.
* 생성 및 수정된 모든 파일은 `docs/` 내의 명세 문서의 검증 기준(Acceptance Criteria)을 100% 충족해야 합니다.
