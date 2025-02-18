// src\server.mjs
// Node.js의 내장 HTTP 모듈을 불러옴
// Node.js 16부터 내장 모듈과 npm 패키지를 구분하기 위해 node: 프리픽스가 추가됨
import http from "node:http";
import { handleRequest } from "./handler.mjs"; // 요청을 처리하는 핸들러 파일 불러오기

// 서버가 실행될 포트 번호
const PORT = 3000;


// HTTP 서버 생성
const server = http.createServer(async (req, res) => {
    try {
        // 요청을 받아서 handler.mjs에서 처리하도록 전달
        await handleRequest(req, res);
    } catch (error) {
        // 서버 내부 오류가 발생했을때 예외 처리 
        console.error("서버 오류", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("서버 내부 오류 발생");
    }
});

// 지정된 포트에서 서버 시작
server.listen(PORT, () => {
    console.log(`실행중인 포트: ${PORT}`);

});