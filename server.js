const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// 정적 파일 서빙
app.use(express.static(path.join(__dirname)));

// GoatCounter API 프록시
app.all('/api/proxy', async (req, res) => {
    const { target, ...params } = req.query;

    if (!target) {
        return res.status(400).json({ error: 'target parameter is required' });
    }

    try {
        // 타겟 URL 생성
        const url = new URL(target);

        // 쿼리 파라미터 추가 (target 제외)
        Object.entries(params).forEach(([key, value]) => {
            if (key !== 'target' && value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });

        console.log('[Proxy Request]', req.method, url.toString());

        const headers = {
            'Accept': 'application/json'
        };

        // Authorization 헤더 전달
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }

        const response = await fetch(url.toString(), {
            method: req.method,
            headers: headers
        });

        const contentType = response.headers.get('content-type');
        const data = await response.text();

        console.log('[Proxy Response]', response.status, contentType);

        // JSON 응답인 경우
        if (contentType && contentType.includes('application/json')) {
            res.status(response.status).set('Content-Type', 'application/json').send(data);
        } else {
            // JSON이 아닌 경우 (HTML 등)
            console.log('[Proxy Warning] Response is not JSON:', data.substring(0, 200));
            res.status(response.status).set('Content-Type', 'text/plain').send(data);
        }
    } catch (err) {
        console.error('[Proxy Error]', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`GoatCounter Dashboard running at http://localhost:${PORT}`);
});
