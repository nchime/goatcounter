# GoatCounter Dashboard - Agent Guidelines

## 프로젝트 개요

GoatCounter 통계 대시보드 웹 애플리케이션. GoatCounter API를 통해 사이트 방문자 통계를 시각화합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  index.html │  │  ECharts    │  │  localStorage│     │
│  │  (UI/Dashboard)│ │ (Charts)   │  │  (Config)    │     │
│  └──────┬──────┘  └─────────────┘  └─────────────┘     │
│         │ fetch()                                        │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                    Express Server (server.js)             │
│  ┌─────────────────────────────────────────────────┐    │
│  │  /api/proxy → GoatCounter API 프록시             │    │
│  │  - Authorization 헤더 전달                        │    │
│  │  - CORS 우회                                     │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│              GoatCounter API (External)                   │
│  https://{siteCode}.goatcounter.com/api/v0/*             │
└─────────────────────────────────────────────────────────┘
```

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Backend | Node.js + Express | 4.18.2 |
| Frontend | Vanilla JavaScript | ES6+ |
| 차트 | ECharts | 5.4.3 |
| 환경변수 | dotenv | 17.4.2 |

## 파일 구조

```
goatcounter/
├── server.js           # Express 서버 + API 프록시
├── index.html          # 메인 대시보드 UI (단일 파일 SPA)
├── test-api.html       # API 테스트 유틸리티
├── .env.example        # 환경변수 템플릿
├── package.json        # 의존성 정의
└── AGENTS.md           # 이 문서
```

## 개발 규칙

### 1. API 키 보안

- API 키는 절대 소스코드에 하드코딩하지 않는다
- 모든 민감 정보는 `localStorage` 또는 `.env` 파일에 저장
- `.env` 파일은 `.gitignore`에 포함

### 2. 프론트엔드 코딩 컨벤션

- **단일 파일 구조**: `index.html`에 CSS, HTML, JS를 모두 포함
- **외부 라이브러리**: CDN 사용 (ECharts)
- **모듈 시스템**: 사용하지 않음 (브라우저 네이티브)
- **변수 선언**: `let`, `const` 사용 (var 지양)
- **함수 선언**: 기명 함수 표현식 사용

### 3. 에러 핸들링

```javascript
// API 호출 시
apiFetch('/stats/total', params)
    .then(function(data) { ... })
    .catch(function(err) {
        console.error('[Error]', err);
        showError('데이터 로드 실패: ' + err.message);
    })
    .then(function() { showLoading(false); }); // finally 대체
```

### 4. 반응형 디자인

- **브레이크포인트**: 768px
- **모바일**: 단일 열 레이아웃
- **데스크톱**: 2열 + 사이드바

### 5. 상태 관리

```javascript
// 전역 상태 객체
let config = { apiKey: '', siteCode: '' };        // API 설정
let datePickerState = { ... };                     // 날짜 선택 상태
let chartInstances = {};                           // ECharts 인스턴스
let pagesData = [];                               // 페이지 통계 데이터
```

## API 엔드포인트 (GoatCounter)

| 엔드포인트 | 설명 | 파라미터 |
|-----------|------|---------|
| `/api/v0/stats/total` | 총 방문자 수 | start, end |
| `/api/v0/stats/hits` | 페이지별 통계 | start, end, limit |
| `/api/v0/stats/browsers` | 브라우저 통계 | start, end, limit |
| `/api/v0/stats/systems` | OS 통계 | start, end, limit |
| `/api/v0/stats/locations` | 지역 통계 | start, end, limit |
| `/api/v0/stats/toprefs` | 추천 소스 | start, end, limit |
| `/api/v0/paths` | 페이지 목록 | - |

## 로컬 개발

```bash
# 설치
npm install

# 개발 서버 시작
npm start

# 브라우저에서 열기
open http://localhost:8000
```

## 환경변수

| 변수 | 필수 | 설명 | 기본값 |
|------|------|------|--------|
| `PORT` | 아니오 | 서버 포트 | 8000 |
| `GOATCOUNTER_API_KEY` | 선택 | API 키 (localStorage 우선) | - |
| `GOATCOUNTER_SECRET` | 선택 | 시크릿 키 | - |

## 수정 시 유의사항

### chart-container 리사이즈

```javascript
// ResizeObserver로 컨테이너 크기 변화 감지
if (window.ResizeObserver) {
    var ro = new ResizeObserver(function() { resizeCharts(); });
    document.querySelectorAll('.chart-container').forEach(function(el) {
        ro.observe(el);
    });
}
```

### 새 차트 추가 시

1. `chartInstances` 객체에 인스턴스 저장
2. `resizeCharts()` 함수에 추가
3. `ResizeObserver` 대상에 `.chart-container` 클래스 부여

### 새 API 엔드포인트 추가 시

1. `loadData()` 함수에 `apiFetch()` 호출 추가
2. `API_DELAY` 간격 유지 (350ms)
3. 에러 핸들링 패턴 준수

## 테스트

`test-api.html`을 사용하여 API 연결 테스트:
1. `npm start`로 서버 시작
2. `http://localhost:8000/test-api.html` 접속
3. API 키와 사이트 코드 입력
4. 각 엔드포인트 테스트 버튼 클릭

## 배포

```bash
# 프로덕션 빌드 없음 (단일 HTML 파일)
# Node.js 서버만 실행하면 됨
PORT=8000 node server.js
```
