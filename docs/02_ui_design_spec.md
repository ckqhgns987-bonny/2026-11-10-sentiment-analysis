# docs/02_ui_design_spec.md - UI 구현 지침서 (레퍼런스 기반)

## 1. 개요
첨부된 'Planet' 웹사이트 레퍼런스를 바탕으로 미니멀하고 세련된 감성 서비스 UI 레이아웃 및 CSS 스타일링 지침을 정의합니다.

## 2. 디자인 시스템 요약
* **Color Palette**:
  * Background: `#FFFFFF` / Light Gray `#F8F9FA`
  * Primary Text & Buttons: Absolute Black (`#000000`)
  * Secondary Text: Dark Gray (`#666666`)
  * Accent Decorative Curve: `#4A80F6` ~ `#C8D6FD` (스카이블루 그라데이션 라인)
  * Sentiment Badges: 긍정 (`#10B981` 초록), 부정 (`#EF4444` 빨강), 중립 (`#F59E0B` 주황)
* **Typography**:
  * Sans-serif 계열 (Pretendard, Inter, 또는 System Font)
  * Hero Title: Extra Bold (Font size 80px~120px 레퍼런스 스타일 대형 텍스트 "EMOTION")
* **Key Components**:
  * Top Bar: 좌측 `Planet` 스타일 로고, 중앙 메뉴 탭, 우측 상단 블랙 알약 형태 버튼(`border-radius: 9999px; background: #000; color: #fff;`)
  * 상단 그라데이션 라인: 레퍼런스 중앙 상단에 위치한 가늘고 완만한 블루 그라데이션 곡선 바

## 3. UI 구조 (HTML/CSS)
* `index.html`:
  * `<header>`: 브랜드 로고, 네비게이션 메뉴, '시작하기/분석하기' 우측 블랙 버튼.
  * `<main>`:
    * Hero Section: "고민 없이 쉽게 입력하세요. 감정을 깊이 있게 분석합니다." 메인 카피 및 초대형 "SENTIMENT" 로고 타이포그래피.
    * Input Card: 텍스트 입력창 (`textarea`), 글자 수 카운터, '감성 분석하기' 버튼.
    * Result Display Card: 분석 결과 (긍정/부정/중립 뱃지, % 그래프 바, 분석 이유 텍스트 상자).
  * `<footer>`: 저작권 표시 및 링크.

## 4. 완료 기준 & 검증 기준 (Acceptance Criteria)
* [ ] 레퍼런스 이미지의 상단 그라데이션 라인 및 우측 상단 블랙 라운드 버튼 형태가 동일하게 구현되었는가?
* [ ] 좌측 하단 대형 Bold 타이포그래피 레이아웃이 브라우저 너비에 따라 반응형으로 깨짐 없이 조정되는가?
* [ ] 분석 결과(뱃지, 백분율, 분석 이유)가 시각적으로 명확히 분리되어 표시되는가?
