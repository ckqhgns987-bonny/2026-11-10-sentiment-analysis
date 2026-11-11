/**
 * ==============================================================================
 * 파일명: public/app.js
 * 설명: Sentiment Planet 프론트엔드 비즈니스 로직 및 인터랙션 스크립트
 * 주요 기능:
 *  1. 실시간 글자 수 카운팅 및 5자~1000자 유효성 검사
 *  2. 백엔드 API (POST /api/analyze) 비동기 통신 (Fetch API)
 *  3. 분석 진행 중 로딩 스피너 및 버튼 비활성화 (중복 요청 방지)
 *  4. AI 감성 결과(긍정/부정/중립, 신뢰도 %, 판단 이유) 동적 렌더링
 *  5. 네트워크/서버 에러 친절한 한국어 안내 처리
 * ==============================================================================
 */

// DOM 요소(HTML 엘리먼트)들이 완전히 로드된 후 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {

  // 1. 제어할 HTML 엘리먼트 참조 가져오기
  const sentimentForm = document.getElementById('sentimentForm');
  const inputText = document.getElementById('inputText');
  const charCounter = document.getElementById('charCounter');
  const helperText = document.getElementById('helperText');
  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = submitBtn.querySelector('.btn-text');

  // 결과 카드 관련 엘리먼트
  const resultPlaceholder = document.getElementById('resultPlaceholder');
  const resultBody = document.getElementById('resultBody');
  const statusIndicator = document.getElementById('statusIndicator');
  const sentimentPill = document.getElementById('sentimentPill');
  const confidenceScore = document.getElementById('confidenceScore');
  const progressBarFill = document.getElementById('progressBarFill');
  const reasonContent = document.getElementById('reasonContent');
  const errorToast = document.getElementById('errorToast');
  const errorMessage = document.getElementById('errorMessage');

  const MIN_LENGTH = 5;
  const MAX_LENGTH = 1000;

  /**
   * 2. 실시간 입력값 유효성 검사 함수
   * 사용자가 키보드로 글을 쓸 때마다 호출되어 버튼 활성화 여부를 결정합니다.
   */
  function validateInput() {
    const text = inputText.value.trim();
    const length = text.length;

    // 글자 수 카운터 업데이트
    charCounter.textContent = `${length} / ${MAX_LENGTH}자`;

    // 에러 알림 박스가 열려있다면 닫아주기
    hideError();

    if (length === 0) {
      helperText.textContent = '최소 5자 이상 입력해주세요.';
      helperText.classList.remove('error');
      submitBtn.disabled = true;
    } else if (length < MIN_LENGTH) {
      helperText.textContent = `현재 ${length}자입니다. 최소 ${MIN_LENGTH}자 이상 입력해주세요.`;
      helperText.classList.add('error');
      submitBtn.disabled = true;
    } else if (length > MAX_LENGTH) {
      helperText.textContent = `최대 ${MAX_LENGTH}자를 초과할 수 없습니다.`;
      helperText.classList.add('error');
      submitBtn.disabled = true;
    } else {
      helperText.textContent = '분석 준비가 완료되었습니다.';
      helperText.classList.remove('error');
      submitBtn.disabled = false;
    }
  }

  // 텍스트 입력창 이벤트 리스너 등록
  inputText.addEventListener('input', validateInput);

  /**
   * 3. 로딩 상태 전환 함수
   * 분석 요청 시 버튼을 비활성화하고 스피너를 보여줍니다.
   *
   * @param {boolean} isLoading - 로딩 여부
   */
  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnSpinner.classList.add('active');
      btnText.textContent = 'AI 분석 중...';
      statusIndicator.textContent = '분석 진행 중';
      statusIndicator.classList.remove('complete');
      hideError();
    } else {
      btnSpinner.classList.remove('active');
      btnText.textContent = '감성 분석하기';
      validateInput(); // 현재 글자 수에 맞게 버튼 활성화 재평가
    }
  }

  /**
   * 4. 에러 메시지 표시 함수
   *
   * @param {string} msg - 사용자에게 표시할 한국어 오류 메시지
   */
  function showError(msg) {
    errorMessage.textContent = msg;
    errorToast.classList.remove('hidden');
    statusIndicator.textContent = '오류 발생';
    statusIndicator.classList.remove('complete');
  }

  /**
   * 에러 메시지 숨기기 함수
   */
  function hideError() {
    errorToast.classList.add('hidden');
  }

  /**
   * 5. 감성 분석 결과 렌더링 함수
   * 백엔드에서 받은 JSON 데이터를 화면의 각 컴포넌트에 바인딩합니다.
   *
   * @param {object} data - { sentiment: '긍정', confidence: 95, reason: '...' }
   */
  function renderResult(data) {
    // 플레이스홀더(대기 안내문) 숨기고 결과 화면 노출
    resultPlaceholder.classList.add('hidden');
    resultBody.classList.remove('hidden');

    // 1) 상태 인디케이터 업데이트
    statusIndicator.textContent = '분석 완료';
    statusIndicator.classList.add('complete');

    // 2) 감성 뱃지(알약) 스타일 및 텍스트 적용
    sentimentPill.textContent = data.sentiment;
    sentimentPill.className = 'sentiment-pill'; // 기본 클래스로 리셋

    if (data.sentiment === '긍정') {
      sentimentPill.classList.add('positive');
    } else if (data.sentiment === '부정') {
      sentimentPill.classList.add('negative');
    } else {
      sentimentPill.classList.add('neutral');
    }

    // 3) 신뢰도 수치 및 프로그레스 바 애니메이션
    const confValue = Math.min(Math.max(data.confidence, 0), 100);
    confidenceScore.textContent = `${confValue}%`;
    
    // 약간의 시간차를 주어 게이지 바가 차오르는 애니메이션 효과 연출
    setTimeout(() => {
      progressBarFill.style.width = `${confValue}%`;
    }, 50);

    // 4) AI 판단 이유 본문 채우기
    reasonContent.textContent = data.reason;
  }

  /**
   * 6. 폼 제출(Submit) 이벤트 핸들러
   * 백엔드 API (POST /api/analyze)로 비동기 Fetch 요청을 전송합니다.
   */
  sentimentForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 기본 폼 새로고침 동작 방지

    const text = inputText.value.trim();

    if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
      showError(`문장은 ${MIN_LENGTH}자 이상 ${MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }

    // 로딩 상태 시작
    setLoadingState(true);

    try {
      // 백엔드 API 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      // 응답 데이터 파싱
      let result;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textError = await response.text();
        result = { success: false, error: `서버 응답 오류 (상태코드: ${response.status})` };
      }

      if (response.ok && result.success) {
        // 성공 시 결과 렌더링
        renderResult(result.data);
      } else {
        // 백엔드에서 반환한 친절한 오류 메시지 표출
        showError(result.error || `감성 분석에 실패했습니다. (상태코드: ${response.status})`);
      }

    } catch (networkError) {
      console.error('[네트워크 통신 에러]:', networkError);
      showError('서버와의 통신이 원활하지 않습니다. 네트워크 상태나 Vercel 로그를 확인해주세요.');
    } finally {
      // 로딩 상태 종료
      setLoadingState(false);
    }
  });

  // 초기 상태 평가 실행
  validateInput();
});
