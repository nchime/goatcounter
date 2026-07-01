# GoatCounter 통계 대시보드

GoatCounter API를 활용한 사이트 통계 대시보드입니다.

## 기능

- 일별 방문자 추이 차트 (ECharts)
- 시간대별 방문자 분포 차트
- Top Referrers, 브라우저, OS, 지역 통계
- 설정 저장 (localStorage)

---

## GoatCounter 사전 설정 가이드

대시보드를 사용하기 전, 모니터링할 대상 사이트에서 GoatCounter를 설정해야 합니다.

### 1단계: GoatCounter 계정 생성

1. https://www.goatcounter.com 접속
2. "Sign up" 클릭
3. 이메일 주소 입력 후 계정 생성
4. 이메일 인증 완료

### 2단계: 사이트 추가

1. GoatCounter 대시보드 로그인
2. 좌측 메뉴 → "Sites" 클릭
3. "Add new site" 클릭
4. **사이트 도메인** 입력 (예: `mysite.com`)
5. "Create" 클릭
6. 생성된 사이트 코드 확인 (예: `mysite` → `mysite.goatcounter.com`)

### 3단계: 대상 사이트에 추적 코드 삽입

 GoatCounter에서 제공하는 추적 코드를 모니터링할 사이트의 HTML `<head>` 또는 `<body>` 끝 부분에 삽입합니다.

#### 방법 1: JavaScript 코드 (권장)

```html
<script data-goatcounter="https://YOURCODE.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

- `YOURCODE`: 2단계에서 확인한 사이트 코드

#### 방법 2: 이미지 픽셀 (JavaScript 비활성화 시)

```html
<img src="https://YOURCODE.goatcounter.com/pv.gif"
     style="display: none;" alt="" referrerpolicy="no-referrer-when-downgrade">
```

#### 프레임워크별 설정 예시

**Next.js (`_document.js` 또는 `layout.js`)**
```jsx
import Script from 'next/script';

// _document.js의 <Head> 안에 추가
<Script
  data-goatcounter="https://YOURCODE.goatcounter.com/count"
  strategy="afterInteractive"
  src="//gc.zgo.at/count.js"
/>
```

**WordPress (테마 헤더)**
```php
<!-- functions.php에 추가 -->
function goatcounter_tracking() {
    echo '<script data-goatcounter="https://YOURCODE.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>';
}
add_action('wp_head', 'goatcounter_tracking');
```

**React (public/index.html)**
```html
<script data-goatcounter="https://YOURCODE.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

**Vue.js (index.html)**
```html
<script data-goatcounter="https://YOURCODE.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

---

## 대상 사이트 설정 상세 가이드

### 1. Content Security Policy (CSP) 설정

대상 사이트에 CSP 헤더가 설정되어 있는 경우, GoatCounter 도메인을 허용 목록에 추가해야 합니다.

#### Nginx 설정

```nginx
# nginx.conf 또는 사이트 설정 파일
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' gc.zgo.at;
    img-src 'self' YOURCODE.goatcounter.com;
    connect-src 'self' YOURCODE.goatcounter.com;
" always;
```

#### Apache 설정 (.htaccess)

```apache
<IfModule mod_headers.c>
    Header set Content-Security-Policy "script-src 'self' 'unsafe-inline' gc.zgo.at; img-src 'self' YOURCODE.goatcounter.com; connect-src 'self' YOURCODE.goatcounter.com;"
</IfModule>
```

#### Next.js (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "script-src 'self' 'unsafe-inline' gc.zgo.at; img-src 'self' YOURCODE.goatcounter.com; connect-src 'self' YOURCODE.goatcounter.com;"
        }
      ]
    }
  ]
};

module.exports = nextConfig;
```

---

### 2. 이벤트 트래킹 설정

 GoatCounter는 커스텀 이벤트도 트래킹할 수 있습니다.

#### 기본 사용법

```html
<button onclick="goatcounter.count_event('button-click')">클릭</button>
```

#### JavaScript에서 이벤트 기록

```javascript
// 페이지뷰 카운트 (기본값)
goatcounter.count();

// 커스텀 이벤트
goatcounter.count_event('signup-completed');
goatcounter.count_event('purchase', { path: '/checkout/success' });

// 커스텀 경로로 페이지뷰 카운트
goatcounter.count({ path: '/custom-page' });

// 리퍼러 무시
goatcounter.count({ event: false });
```

#### 상품 구매 트래킹 예시

```html
<script>
function trackPurchase(orderId, amount) {
    goatcount.count_event('purchase', {
        path: '/purchase/' + orderId,
        title: 'Purchase: $' + amount
    });
}
</script>

<button onclick="trackPurchase('12345', 99.99)">구매하기</button>
```

#### 폼 제출 트래킹 예시

```javascript
document.getElementById('contact-form').addEventListener('submit', function(e) {
    goatcounter.count_event('form-submit', {
        path: '/contact/success',
        title: 'Contact Form Submitted'
    });
});
```

---

### 3. 커스텀 변수 설정

페이지별로 커스텀 변수를 전달하여 더 세밀한 분석이 가능합니다.

```html
<script data-goatcounter="https://YOURCODE.goatcounter.com/count"
        data-goatcounter-settings='{
            "path": "/custom-path",
            "title": "커스텀 페이지 제목",
            "event": false
        }'
        async src="//gc.zgo.at/count.js"></script>
```

#### 동적 경로 설정 (SPA)

```javascript
// React Router, Vue Router 등에서 라우트 변경 시
window.addEventListener('popstate', function() {
    goatcounter.count({ path: window.location.pathname });
});

// 또는 프레임워크별 라우트 이벤트에서
router.afterEach(function(to) {
    goatcounter.count({ path: to.fullPath });
});
```

---

### 4. 특정 페이지 제외

관리자 페이지 등 특정 페이지는 트래킹에서 제외할 수 있습니다.

#### 방법 1: JavaScript로 제외

```javascript
// 관리자 페이지에서는 카운트하지 않음
if (window.location.pathname.startsWith('/admin')) {
    // 추적 코드 미로드
} else {
    // 추적 코드 로드
    var script = document.createElement('script');
    script.src = '//gc.zgo.at/count.js';
    script.dataset.goatcounter = 'https://YOURCODE.goatcounter.com/count';
    document.head.appendChild(script);
}
```

#### 방법 2: 서버사이드에서 조건부 삽입

```php
<?php if (!$is_admin_page): ?>
<script data-goatcounter="https://YOURCODE.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
<?php endif; ?>
```

#### 방법 3: GoatCounter 설정에서 IP 무시

GoatCounter 대시보드 → Settings → IPs에서 특정 IP를 무시 목록에 추가할 수 있습니다.

---

### 5. Do Not Track (DNT) 지원

 GoatCounter는 브라우저의 Do Not Track 설정을 자동으로 지원합니다. 사용자가 DNT를 활성화하면 자동으로 카운트되지 않습니다.

추가적인 프라이버시 설정:

```html
<script data-goatcounter="https://YOURCODE.goatcounter.com/count"
        data-goatcounter-allow-local="false"
        async src="//gc.zgo.at/count.js"></script>
```

- `data-goatcounter-allow-local="false"`: 로컬호스트에서 카운트하지 않음

---

### 6. 서버 설정 (Self-hosted 경우)

 GoatCounter를 직접 호스팅하는 경우, 대상 사이트의 서버에서 추가 설정이 필요할 수 있습니다.

#### 방화벽 설정

 GoatCounter 서버로의 아웃바운드 연결을 허용해야 합니다.

```bash
# AWS Security Group 예시
Outbound Rule:
  - Type: HTTPS (443)
  - Destination: YOURCODE.goatcounter.com IP 대역
```

#### DNS 설정 (커스텀 도메인 사용 시)

 GoatCounter를 커스텀 도메인으로 호스팅하는 경우:

```dns
# DNS 레코드 추가
stats.yoursite.com.  CNAME  yourcode.goatcounter.com.
```

GoatCounter 대시보드 → Settings → Custom domain에서 도메인을 설정하고 DNS 레코드를 추가하세요.

---

### 7. 테스트 및 디버깅

#### 개발자 도구로 확인

1. 대상 사이트 접속
2. 브라우저 개발자 도구 (F12) 열기
3. **Network** 탭에서 `count` 요청 확인
4. **Console** 탭에서 `goatcounter` 객체 확인

```javascript
// 테스트 코드
console.log(goatcounter.count_event('test-event'));
```

#### 확인 사항

- [ ] `count.js` 스크립트가 로드되는지 확인
- [ ] 네트워크 탭에서 `/count` 엔드포인트로 요청이 가는지 확인
- [ ] GoatCounter 대시보드에서 데이터가 반영되는지 확인
- [ ] CSP 설정으로 인해 차단되지 않는지 확인
- [ ] 프록시 서버, CDN 등에서 요청이 차단되지 않는지 확인

### 4단계: API 키 발급

1. GoatCounter 대시보드 좌측 메뉴 → "Settings" 클릭
2. 상단 탭 → "API" 클릭
3. "Create new API token" 클릭
4. **이름** 입력 (예: `dashboard`)
5. **권한 선택**: `Read` (조회 전용)
6. 생성된 API 키 복사 (한 번만 표시됨)

### 5단계: 데이터 수집 확인

1. 대상 사이트에 접속하여 페이지 이동
2. GoatCounter 대시보드에서 실시간 데이터 확인
3. 최소 10초~1분 후 데이터 반영

### 6단계: 이 대시보드 연결

1. 이 대시보드 실행 (`npm start`)
2. 우측 상단 "설정" 버튼 클릭
3. **API 키**: 4단계에서 발급받은 키 입력
4. **사이트 코드**: 2단계에서 확인한 코드 입력
5. 저장 후 "조회" 클릭

---

## 대시보드 실행 방법

### 1. 의존성 설치

```bash
cd goatcounter
npm install
```

### 2. 서버 실행

```bash
npm start
```

브라우저에서 http://localhost:8000 으로 접속하세요.

## 설정

우측 상단 "설정" 버튼 클릭:
- API 키: GoatCounter API 설정에서 발급
- 사이트 코드: `mysite.goatcounter.com` 형식에서 `mysite` 부분

## 문제 해결

### CORS 오류

이 대시보드는 CORS 우회를 위해 내장 프록시 서버를 사용합니다. 반드시 `npm start`로 서버를 실행하고 접속하세요. `python3 -m http.server`로 실행하면 CORS 오류가 발생합니다.

### 데이터가 표시되지 않는 경우

1. 추적 코드가 대상 사이트에 올바르게 삽입되었는지 확인
2. 대상 사이트에 실제 방문자가 있어야 데이터가 수집됨
3. GoatCounter 대시보드에서 데이터 수신 여부 확인
4. API 키와 사이트 코드가 정확한지 확인

### 프라이버시 관련

- GoatCounter는 GDPR, CCPA 등 개인정보 보호 규정을 준수합니다
- IP는 해시 처리되어 저장되며, raw IP는 저장하지 않음
- 쿠키를 사용하지 않음 (ingerprinting 방지)
- "Do Not Track" 헤더를 지원함
