/**
 * ==============================================================================
 * 파일명: server.js
 * 설명: 로컬 개발 및 테스트를 위한 Express 웹 서버 엔트리 파일
 * 주요 기능:
 *  1. public/ 폴더의 정적 파일(HTML, CSS, JS) 서빙
 *  2. /api/analyze 경로로 감성 분석 API 라우팅
 *  3. 로컬 3000번 포트 리스닝
 * ==============================================================================
 */

// 환경 변수 로드 (.env)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const analyzeHandler = require('./api/analyze');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 등록: CORS 및 JSON 바디 파서
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (public 폴더 내의 index.html, style.css, app.js 등)
app.use(express.static(path.join(__dirname, 'public')));

// 감성 분석 API 엔드포인트 연결
app.all('/api/analyze', (req, res) => {
  return analyzeHandler(req, res);
});

// 서버 기동
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Sentiment Planet 웹 서버가 정상 실행되었습니다.`);
  console.log(`👉 브라우저 접속 주소: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

