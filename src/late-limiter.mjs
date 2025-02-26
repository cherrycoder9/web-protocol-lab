// src\late-limiter.mjs
// Rate Limiting은 특정 IP나 클라이언트로부터 너무 많은 요청이 들어오는 것을 제한해
// 무차별 공격(DoS/DDoS)이나 악의적 사용으로부터 서버를 보호함
// 각 클라이언트의 요청수를 추적해 과요청시 429 에러를 응답하는 간단한 구현

const rateLimit = 10; // 허용할 최대 요청수 
const windowMs = 60 * 1000; // 제한 기간 60초
const ipRequests = new Map(); // IP별 요청 정보를 저장할 Map

export function checkRateLimit(req, res) {
    // 클라이언트 IP 주소를 가져옴
    const ip = req.socket.remoteAddress || "unknown";
    const now = Date.now();
    console.log(ip);
    // ::1이 출력되는데 이것은 IPv6의 루프백 주소임
    // IPv4의 "127.0.0.1"과 동일하게 자기 자신을 가리킴 (localhost)
    // 최신 운영체제에선 로컬 접속시 IPv6 주소를 사용하는 경우가 많기 때문에 정상 


    // 해당 IP에 대한 기록이 없으면 새로 추가 
    if (!ipRequests.has(ip)) {
        ipRequests.set(ip, { count: 1, startTime: now });
        return true;
    }

    // 해당 IP에 대한 기록을 가져옴
    const data = ipRequests.get(ip);
    console.log(data);

    // 현재 시간이 시작 시간(windowMs) 이내이면
    if (now - data.startTime < windowMs) {
        // 요청 횟수가 허용 범위를 초과한 경우
        if (data.count >= rateLimit) {
            // 429 Too Many Requests 응답 전송
            res.writeHead(429, { "Content-Type": "text/plain; charset=UTF-8" });
            res.end("잠시후 다시 시도하세요.");
            return false;
        } else {
            // 허용 범위 이내면 요청 횟수 증가후 허용 
            data.count++;
            return true;
        }
    } else {
        // 제한 기간이 지난 경우, 카운트 리셋 
        ipRequests.set(ip, { count: 1, startTime: now });
        return true;
    }
}