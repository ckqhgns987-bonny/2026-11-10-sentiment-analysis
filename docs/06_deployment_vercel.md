# docs/06_deployment_vercel.md - Vercel 배포 지침서

## 1. 개요
본 프로젝트를 Vercel 플랫폼에 정적 웹사이트(프론트엔드) 및 Serverless Function(백엔드 API) 구조로 배포하는 절차와 환경변수 설정 지침입니다.

## 2. `vercel.json` 구성 지침
```json
{
  "version": 2,
  "builds": [
    { "src": "public/**", "use": "@vercel/static" },
    { "src": "api/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

## 3. 배포 순서 및 환경 변수 등록
1. Vercel CLI 또는 Vercel Web Dashboard를 통해 GitHub 저장소 연동.
2. **Environment Variables 설정**:
   * `OPENAI_API_KEY`
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
3. 배포 버튼 클릭 또는 `vercel --prod` 명령 실행.

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] 생성된 Vercel 도메인 (예: `https://your-project.vercel.app`)에 접속 시 메인 UI가 정상 표시되는가?
* [ ] 배포된 환경에서 텍스트 입력 후 분석 요청 시 CORS 에러 없이 OpenAI API 및 Supabase DB 연동이 정상 작동하는가?
