/**
 * ==============================================================================
 * 파일명: api/analyze.js
 * 설명: 텍스트 감성 분석 백엔드 API 핸들러 (Vercel Serverless Function & Express 공용)
 * 주요 기능:
 *  1. 사용자 입력 텍스트 유효성 검사 (5자 이상, 1000자 이하)
 *  2. OpenAI API(gpt-4o-mini) 호출을 통한 감성(긍정/부정/중립), 신뢰도(%), 이유 추출
 *  3. 분석 결과를 Supabase의 sentiment_logs 테이블에 안전하게 비동기 저장
 *  4. 표준화된 JSON 형식으로 클라이언트에 결과 반환
 * ==============================================================================
 */

// dotenv 설정 로드 (로컬 환경 실행 시 .env 파일 내용 로드)
require('dotenv').config();

// OpenAI 공식 라이브러리 및 Supabase 클라이언트 라이브러리 임포트
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

// 1. OpenAI 클라이언트 초기화
// .env 파일의 OPENAI_API_KEY 환경변수를 사용합니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 2. Supabase 클라이언트 초기화
// 환경변수가 등록되어 있을 때만 클라이언트를 생성하여 안전하게 방어합니다.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_supabase_url_here')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('[주의] Supabase 환경 변수가 설정되지 않았거나 기본 템플릿 상태입니다. DB 저장이 비활성화될 수 있습니다.');
}

/**
 * 감성 분석 처리 메인 핸들러 함수
 * Express 라우터 및 Vercel Serverless Function에서 req, res를 받아 처리합니다.
 *
 * @param {import('express').Request} req - 클라이언트 요청 객체
 * @param {import('express').Response} res - 클라이언트 응답 객체
 */
async function analyzeHandler(req, res) {
  // CORS 헤더 설정 (필요 시 외부 도메인 호출 허용)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Preflight(OPTIONS) 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 메서드만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않는 HTTP 메서드입니다. POST 요청만 지원합니다.'
    });
  }

  try {
    // 1. 클라이언트 요청 본문(body) 추출
    // Express 및 Serverless 환경에서 본문 파싱 처리
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const rawText = body && body.text ? body.text : '';
    const text = String(rawText).trim();

    // 2. 입력값 유효성 검사 (Validation)
    // 명세서 기준: 최소 5자 이상, 최대 1000자 이하
    if (!text || text.length < 5) {
      return res.status(400).json({
        success: false,
        error: '입력 텍스트가 너무 짧습니다. 5자 이상 입력해주세요.'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: '입력 텍스트가 너무 깁니다. 1,000자 이하로 작성해주세요.'
      });
    }

    // 3. OpenAI API 키 존재 여부 검증
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
      return res.status(500).json({
        success: false,
        error: '서버에 OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.'
      });
    }

    // 4. OpenAI API 호출 (gpt-4o-mini 모델 및 JSON 모드 적용)
    const promptSystem = `당신은 한국어 감성 분석 전문가입니다. 사용자의 입력 텍스트를 분석하여 sentiment ('긍정', '부정', '중립' 중 하나), confidence (0에서 100 사이의 정수), reason (분석 이유 한국어 2~3문장)만을 담은 JSON 객체로 반환하십시오.
반드시 아래 JSON 포맷을 준수해야 합니다:
{
  "sentiment": "긍정" | "부정" | "중립",
  "confidence": 95,
  "reason": "구체적인 한국어 설명"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3 // 일관되고 정밀한 분석을 위해 낮은 온도값 설정
    });

    // 5. OpenAI 응답 데이터 파싱 및 안전 검증
    const responseContent = completion.choices[0].message.content;
    let parsedResult;

    try {
      parsedResult = JSON.parse(responseContent);
    } catch (parseErr) {
      console.error('[OpenAI JSON 파싱 오류]:', parseErr);
      return res.status(500).json({
        success: false,
        error: 'AI 분석 결과를 해석하는 도중 오류가 발생했습니다.'
      });
    }

    // 감성 값 정규화 및 방어 코드 (반드시 '긍정', '부정', '중립' 중 하나여야 함)
    let sentiment = parsedResult.sentiment ? String(parsedResult.sentiment).trim() : '중립';
    if (!['긍정', '부정', '중립'].includes(sentiment)) {
      if (sentiment.includes('긍정') || sentiment.toLowerCase().includes('positive')) sentiment = '긍정';
      else if (sentiment.includes('부정') || sentiment.toLowerCase().includes('negative')) sentiment = '부정';
      else sentiment = '중립';
    }

    // 신뢰도 숫자 범위 안전 검증 (0 ~ 100)
    let confidence = parseInt(parsedResult.confidence, 10);
    if (isNaN(confidence) || confidence < 0) confidence = 50;
    if (confidence > 100) confidence = 100;

    const reason = parsedResult.reason || '입력된 텍스트의 어조와 문맥을 고려하여 감성을 분석하였습니다.';

    const analysisData = {
      sentiment,
      confidence,
      reason
    };

    // 6. Supabase 데이터베이스 저장 (비동기 수행)
    // 요구사항: DB 저장에 실패하더라도 사용자 분석 결과 반환이 중단되지 않도록 안전하게 분리 처리
    if (supabase) {
      try {
        const { error: dbError } = await supabase
          .from('sentiment_logs')
          .insert([
            {
              input_text: text,
              sentiment: analysisData.sentiment,
              confidence: analysisData.confidence,
              reason: analysisData.reason
            }
          ]);

        if (dbError) {
          console.error('[Supabase DB 저장 경고]:', dbError.message);
        } else {
          console.log('[Supabase DB 저장 완료] ID 저장 성공');
        }
      } catch (dbException) {
        console.error('[Supabase DB 예외 발생]:', dbException.message);
      }
    }

    // 7. 성공 결과 반환 (명세서 200 OK 형식 준수)
    return res.status(200).json({
      success: true,
      data: analysisData
    });

  } catch (err) {
    console.error('[서버 내부 에러]:', err);
    return res.status(500).json({
      success: false,
      error: '감성 분석 처리 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
}

// 모듈로 내보내어 Vercel 및 Express 양쪽에서 사용할 수 있도록 구성
module.exports = analyzeHandler;

