// src\server.mjs
// Node.js의 내장 HTTP 모듈을 불러옴
// Node.js 16부터 내장 모듈과 npm 패키지를 구분하기 위해 node: 프리픽스가 추가됨
import dotenv from "dotenv";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { handleRequest } from "./handler.mjs"; // 요청을 처리하는 핸들러 파일 불러오기

dotenv.config(); // .env 파일 로드

// PFX 인증서 로드 
const options = {
    pfx: fs.readFileSync(path.resolve("localhost.pfx")),
    passphrase: process.env.PFX_PASSWORD, // .env에서 불러오기 
};

// HTTPS 서버 생성
const server = https.createServer(options, async (req, res) => {
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
});