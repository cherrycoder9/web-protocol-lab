// src\cors.mjs

// CORS는 웹 브라우저의 동일 출처 정책으로 인해
// 다른 도메인에서 리소스를 요청할 때 발생하는 제한을 완화하기 위해 사용
// 웹 API나 리소스를 여러 출처에서 안전하게 접근할 수 있도록 허용함

export function handleCORS(req, res) {
    // 모든 출처에 대해 접근 허용
    // "*"는 공개 API에 접합하며, 민감 정보가 있는 경우 구체적인 도메인을 명시해야 함 
    res.setHeader("Access-Control-Allow-Origin", "*");
    // 허용할 HTTP 메서드 설정 (예: GET, POST, PUT, DELETE, OPTIONS)
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    // 허용할 요청 헤더 설정 (예: Content-Type, Authorization 등)
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    // 프리플라이트 OPTIONS 요청일 경우 별도의 응답으로 종료 (204 No Content)
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return true;
    }
    return false;
}