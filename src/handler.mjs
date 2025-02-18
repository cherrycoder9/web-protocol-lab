// src\handler.mjs
import { readFile } from "node:fs/promises";
import path from "node:path"; // 파일 경로 처리를 위한 모듈 

// 정적 파일을 제공하는 함수
async function serveStaticFile(filePath, res) {
    try {
        // 요청된 파일을 비동기로 읽어옴
        const data = await readFile(filePath);

        // 파일의 확장자에 맞는 적절한 MINE 타입 설정
        res.writeHead(200, { "Content-Type": getContentType(filePath) });

        // 읽은 파일 내용을 응답으로 반환
        res.end(data);
    } catch {
        // 파일이 존재하지 않으면 404 응답
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
}

// MINE 타입을 결정하는 함수 (파일 확장자 기반)
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    // 객체를 사용한 맵핑 방식과 기본값 설정을 결합한 표현, 객체가 없을때 기본값 적용
    return {
        // 아래에 써진 확장자들을 지원함, 예를들어 css부분을 주석처리하고 테스트해보면 알 수 있음 
        // 모든 확장자를 이런식으로 넣으면 불편하므로 필요하면 mime-types 라이브러리를 사용하면 됨 
        // npm install mime-types를 해야함 
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
    }[ext] || "application/octet-stream"; // 기본적으로 바이너리 데이터로 처리
}

// 요청을 처리하는 메인 함수 (라우팅 역할)
export async function handleRequest(req, res) {
    const { method, url } = req; // 요청의 HTTP 메서드(GET, POST 등)와 URL 가져오기

    // GET 요청 처리
    if (method === "GET") {
        // 루트 경로('/') 요청시 index.html 반환
        if (url === "/") {
            return serveStaticFile("./public/index.html", res);
        }

        // /public/ 경로의 정적 파일 제공
        if (url.startsWith("/public/")) {
            // 현재 실행중인 디렉터리에서 상대 경로를 해석할 수 있게 하기위해 .을 붙임
            // .을 붙이지 않는다면 어떻게 될까?
            // 요청된 URL이 http://localhost:3000/public/style.css 라고 가정해보자
            // 요청 받았을때 url 값은 url = "/public/style.css" 이다
            // 이러면 fs.readFile()은 /public/style.css라는 절대 경로를 찾으려 한다
            // 하지만 이 경로는 파일 시스템에서 존재하지 않음
            // 서버 루트가 아니라 OS의 루트 디렉토리에서 찾게 된다
            // 따라서 public 하위 폴더와 파일들이 적용되지 않게 된다
            return serveStaticFile("." + url, res);
            // return serveStaticFile(url, res);
        }

        // 특정 API 요청이 아니라면 기본 응답 반환
        res.writeHead(200, { "Content-Type": "text/plain" });
        // curl http://localhost:3000/hello
        res.end("서버가 정상적으로 작동 중입니다.");
    }
    // 허용되지 않은 HTTP 메서드 처리
    else {
        // 서버에서 허용하지 않은 HTTP 메서드를 사용한 경우 
        res.writeHead(405, { "Content-Type": "text/plain" });
        // curl -X POST http://localhost:3000/
        res.end("허용되지 않은 요청 방식입니다.");
    }
}