// src\csp.mjs

// CSP는 웹 페이지에 로드되는 리소스의 출처를 제한함으로써 악의적인 스크립트 삽입(XSS) 및
// 데이터 주입 공격을 방지함
// 외부에서 임의의 스크립트나 스타일이 로드되는 것을 차단해 잘못된 코드 실행이나 콘텐츠 변조 위험을 낮춤

/**
 * # 정책 예시 
 * default-src 'self': 기본적으로 같은 출처에서만 리소스를 로드
 * script-src 'self': 스크립트는 같은 출처에서만 로드 
 * style-src 'self': 스타일시트 역시 같은 출처에서만 로드 
 * 
 * @param {import('http').ServerResponse} res - HTTP 응답 객체 
 */
export function applyCSP(res) {
    const cspPolicy = "default-src 'self'; script-src 'self'; style-src 'self'";
    res.setHeader("Content-Security-Policy", cspPolicy);
    // 필요에 따라 정책을 확장하거나 세분화할 수 있음 
}