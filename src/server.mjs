// src\server.mjs
// Node.js의 내장 HTTP 모듈을 불러옴
// Node.js 16부터 내장 모듈과 npm 패키지를 구분하기 위해 node: 프리픽스가 추가됨
import dotenv from "dotenv";
import crypto from "node:crypto"; // 세션 티켓 키 생성을 위해 사용 
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { handleRequest } from "./handler.mjs"; // 요청을 처리하는 핸들러 파일 불러오기
import { startOCSPStapling } from "./ocsp-updater.mjs";
import { setupZeroRTT } from "./zeroRTT.mjs";

dotenv.config(); // .env 파일 로드

// 기본 TLS 옵션 (pfx 인증서, TLS 1.3 강제 등)
const baseOptions = {
    pfx: fs.readFileSync(path.resolve("localhost.pfx")),
    passphrase: process.env.PFX_PASSWORD, // .env에서 불러오기

    // TLS 1.3을 강제하기 위한 설정, nodejs 12.9.0 버전부터 지원하기 시작함 
    // minVersion과 maxVersion을 모두 "TLSv1.3"으로 설정하면 TLS 1.3만 사용하도록 제한됨 
    // 개발자도구 -> 보안 -> 주요출처 -> 연결 -> 프로토콜 에서 확인가능 
    minVersion: "TLSv1.3",
    maxVersion: "TLSv1.3",
    // 최신 TLS 1.3 암호 Suite나 기타 보안 옵션을 필요에 따라 추가할 수 있음

    // 초기 OCSP 응답은 빈 버퍼로 설정함 
    // openssl s_client -connect localhost:443 -status
    // 위 명령어로 확인가능, 빈 버퍼는 실제로 적용되지 않음 
    ocspResponse: Buffer.alloc(0),

    // 세션 재개와 0-RTT 지원을 위한 옵션
    sessionTimeout: 300, // 세션 유효시간 (초)
    ticketKeys: crypto.randomBytes(48), // 티켓 키 (실제 환경에선 고정 키를 안전하게 보관)
};

// HTTPS 서버 생성 - 요청은 handler.mjs에서 처리 
const server = https.createServer(baseOptions, async (req, res) => {
    try {
        // 요청을 받아서 handler.mjs에서 처리하도록 전달
        await handleRequest(req, res);
    } catch (error) {
        // 서버 내부 오류가 발생했을때 예외 처리 
        console.error("서버 오류", error);
        res.writeHead(500, { "Content-Type": "text/plain; charset=UTF-8" });
        res.end("서버 내부 오류 발생");
    }
});

// 서버가 실행될 포트 번호
const PORT = 443;

// 지정된 포트에서 서버 시작
server.listen(PORT, () => {
    console.log(`실행중인 포트: ${PORT}`);
    // OCSP Stapling 업데이트 시작 
    startOCSPStapling(server, baseOptions);
    setupZeroRTT(server);
});