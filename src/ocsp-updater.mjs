// src\ocsp-updater.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * OCSP 응답을 가져오는 함수
 * 실제 환경에서는 CA의 OCSP responder에 요청해 응답을 받아와야 함
 * 지금은 테스트 용도로 더미 파일을 읽어오는 예시 
 *
 * @export
 * @async
 * @returns {Promise<Buffer>} OCSP 응답 데이터 (DER 형식) 
 */
export async function fetchOCSPResponse() {
    try {
        // 테스트용 더미파일이 있다면 해당 데이터를 OCSP 응답으로 사용함
        const ocspData = await readFile(path.resolve("dummy_ocsp.der"));
        return ocspData;
    } catch (error) {
        console.error("OCSP 응답을 가져오는데 실패했습니다. 빈 응답을 사용합니다.", error);
        return Buffer.alloc(0);
    }
}

/**
 * OCSP Stapling 업데이트를 시작하는 함수
 * 주기적으로 새로운 OCSP 응답을 받아 HTTPS 서버의 TLS secure context 업데이트
 *
 * @export
 * @param {import("node:https").Server} server - HTTPS 서버 인스턴스 
 * @param {object} baseOptions - 기존 TLS 옵션 (pfx, passphrase, TLS 버전 등)
 */
export function startOCSPStapling(server, baseOptions) {
    async function updateOCSP() {
        const ocspResponse = await fetchOCSPResponse();
        console.log("새 OCSP 응답을 가져왔습니다. TLS secure context를 업데이트합니다.");
        // 기존 옵션에 새로운 ocspResponse를 추가해 업데이트
        const newOptions = { ...baseOptions, ocspResponse };
        // 서버의 TLS secure context를 업데이트
        server.setSecureContext(newOptions);
    }

    // 초기 업데이트를 즉시 실행
    updateOCSP();
    // 이후 1시간마다 갱신 (테스트시엔 간격 줄여서 확인)
    setInterval(updateOCSP, 3600000);
}