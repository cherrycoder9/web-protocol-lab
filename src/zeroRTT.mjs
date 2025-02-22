// src\zeroRTT.mjs
// Zero-RTT는 TLS 1.3의 기능으로, 이전에 확립된 세션(ticket)을 재사용해
// 클라이언트가 초기 핸드쉐이크 단계에서 추가 왕복 시간을 기다리지 않고
// 애플리케이션 데이터를 전송할 수 있게 함
// 특히 GET 등 멱등성이 있는 요청에서 초기 응답 지연시간을 줄여주므로
// 보안은 유지하면서 사용자 경험을 향상시킴
// 재전송 공격(reply attack) 위험도 있으므로 안전한 요청(GET, HEAD) 에서만 사용하는 등 주의 필요

/**
 * TLS 1.3의 세션 재개를 통해 클라이언트가 초기 데이터(early data)를 전송할 수 있도록 함
 * 실제 환경에선 세션 데이터를 별도의 저장소에 보관해 안전하게 관리해야 함 
 */

/**
 * Zero-RTT 처리를 위한 이벤트 핸들러를 서버에 설정 
 *
 * @export
 * @param {import('https').Server} server - HTTPS 서버 인스턴스 
 */
export function setupZeroRTT(server) {
    // 새로운 세션이 생성될때 호출됨
    server.on("newSession", (sessionId, sessionData, callback) => {
        console.log("새로운 세션 생성: ", sessionId.toString("hex"));
        // 실제 환경에선 sessionData를 세션 스토어에 저장
        callback(null); // 오류 없이 세션 저장 완료
    });

    // 클라이언트가 세션 재개를 요청할 때 호출됨
    server.on("resumeSession", (sessionId, callback) => {
        console.log("세션 재개 요청: ", sessionId.toString("hex"));
        // 실제 환경에선 저장된 sessionData 조회해 callback으로 전달
        // 여기선 예시로 세션이 없음을 의미하는 null 전달
        callback(null, null);
    });

    // TLS 엔진은 클라이언트가 early data를 전송했을때 자동으로 처리함
    // 클라이언트의 TLSSocket 객체에서 isSessionReused 및 earlyData 속성 확인할 수 있음 
}