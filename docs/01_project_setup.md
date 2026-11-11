# docs/01_project_setup.md - 프로젝트 생성 및 환경 설정 지침

## 1. 개요
본 문서는 프로젝트 디렉토리 구조 설정, Node.js 패키지 초기화 및 환경 변수 구성 방법과 검증 기준을 정의합니다.

## 2. 폴더 및 파일 구조
```text
sentiment-service/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── api/
│   └── analyze.js (Vercel Serverless Function / Express route)
├── .env.example
├── .gitignore
├── package.json
└── vercel.json
```

## 3. 구현 단계별 지침
1. **Node.js 프로젝트 초기화**:
   * `npm init -y` 명령어를 통해 `package.json` 생성.
   * 필요 패키지 설치: `express`, `@supabase/supabase-js`, `openai`, `dotenv`, `cors`.
2. **환경 변수 파일 생성 (`.env.example` & `.env`)**:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   PORT=3000
   ```
3. **`.gitignore` 설정**:
   * `node_modules/`, `.env`, `.DS_Store` 등을 반드시 포함하여 보안 유출 방지.

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] `npm install` 실행 시 에러 없이 모든 패키지가 정상 설치되어야 함.
* [ ] `.env` 파일에 API Key가 설정되어 있을 때 백엔드 노드 서버가 3000번 포트에서 정상 실행되어야 함.
* [ ] Git 저장소에 `.env` 파일이 추적되지 않아야 함 (`git status`로 검증).
