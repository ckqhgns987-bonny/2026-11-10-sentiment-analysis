# docs/04_backend_api.md - 백엔드 API & OpenAI 연동 지침

## 1. 개요
Node.js (Express 또는 Vercel Serverless Functions)를 이용하여 `/api/analyze` 엔드포인트를 구축하고, OpenAI API를 호출하여 프롬프트엔지니어링 기반 정형화된 JSON 응답을 받아오는 지침입니다.

## 2. API 명세
* **Endpoint**: `POST /api/analyze`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "text": "오늘 친구들과 바닷가에 가서 너무 즐거운 시간을 보냈다."
  }
  ```
* **Response Body (Success 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "sentiment": "긍정",
      "confidence": 95,
      "reason": "바닷가 방문과 즐거운 시간을 보냈다는 표현에서 매우 명확한 기쁨과 만족감이 드러납니다."
    }
  }
  ```
* **Response Body (Error 400/500)**:
  ```json
  {
    "success": false,
    "error": "입력 텍스트가 너무 짧습니다. 5자 이상 입력해주세요."
  }
  ```

## 3. OpenAI Prompt Engineering 규칙
* 모델: `gpt-4o-mini` (또는 `gpt-3.5-turbo`)
* `response_format`: `{ "type": "json_object" }` 사용 필수.
* System Prompt 지침:
  > "당신은 한국어 감성 분석 전문가입니다. 사용자의 입력 텍스트를 분석하여 sentiment ('긍정', '부정', '중립' 중 하나), confidence (0에서 100 사이의 정수), reason (분석 이유 한국어 2~3문장)만을 담은 JSON 객체로 반환하십시오."

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] Postman 또는 curl로 POST 요청 시 반드시 지정된 JSON 구조로 응답이 반환되는가?
* [ ] OpenAI API 키 미설정 또는 오류 발생 시 500 에러와 함께 JSON 규격의 에러 메시지를 반환하는가?
* [ ] `sentiment` 값이 반드시 '긍정', '부정', '중립' 중 하나로 엄격히 제한되어 출력되는가?
