// src\csp.mjs

// CSP는 웹 페이지에 로드되는 리소스의 출처를 제한함으로써 악의적인 스크립트 삽입(XSS) 및
// 데이터 주입 공격을 방지함
// 외부에서 임의의 스크립트나 스타일이 로드되는 것을 차단해 잘못된 코드 실행이나 콘텐츠 변조 위험을 낮춤

// Trusted Types는 동적으로 생성되는 스크립트나 HTML 조각에 대해 사전에 정의된 정책만 사용하도록 강제해 공격자가 악의적으로 스크립트를 삽입하는 것을 차단함, 최신 웹브라우저에서만 지원.

/**
 * # 정책 예시 
 * default-src 'self': 기본적으로 같은 출처에서만 리소스를 로드
 * script-src 'self': 스크립트는 같은 출처에서만 로드 
 * style-src 'self': 스타일시트 역시 같은 출처에서만 로드 
 * require-trusted-types-for 'script': 동적 스크립트 생성시 Trusted Types 정책을 반드시 사용하도록 강제
 * trusted-types default: 'default' 라는 이름의 기본 Trusted Types 정책 사용 (추가 정책이 필요한 경우 확장 가능) 
 * 
 * @param {import('http').ServerResponse} res - HTTP 응답 객체 
 */
export function applyCSP(res) {
    // CSP 정책을 배열로 구성한 다음 세미콜론으로 연결함 
    const cspPolicy = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "require-trusted-types-for 'script'",
        "trusted-types default"
    ].join("; ");


    res.setHeader("Content-Security-Policy", cspPolicy);
    // 필요에 따라 정책을 확장하거나 세분화할 수 있음 
}