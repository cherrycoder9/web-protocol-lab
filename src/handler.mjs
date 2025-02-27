// src\handler.mjs
import { readFile } from "node:fs/promises";
import path from "node:path"; // 파일 경로 처리를 위한 모듈
import { applyCSP } from "./csp.mjs";
import { generateETag } from "./etag.mjs";

/**
 * 정적 파일을 제공하는 함수 (ETag 지원 포함)
 *
 * @async
 * @param {import('http').IncomingMessage} req - 클라이언트 요청 객체
 * @param {string} filePath - 제공할 파일의 경로 
 * @param {import('http').ServerResponse} res - 응답 객체 
 */
async function serveStaticFile(req, filePath, res) {
    try {
        // 요청된 파일을 비동기로 읽어옴
        const data = await readFile(filePath);
        // 파일 데이터를 기반으로 ETag 생성
        const etag = generateETag(data);

        // 클라이언트가 보낸 If-None-Match 헤더와 비교 
        if (req.headers["if-none-match"] === etag) {
            // 파일이 변경되지 않았다면 304 Not Modified 응답 
            res.writeHead(304);
            res.end();
            return;
        }

        // 파일의 확장자에 따른 적절한 MIME 타입 결정
        const contentType = getContentType(filePath);

        // 200 응답과 함께 파일 데이터 및 ETag 헤더 전송 
        res.writeHead(200, {
            "Content-Type": contentType,
            "ETag": etag,
            // CSP 헤더는 이미 handleRequest()에서 적용됨 
        });
        // 인자를 넘기지 않으면 그냥 응답을 끝내고 데이터를 넘기면 그 데이터를 마지막으로 보내고 끝냄
        res.end(data); // 응답을 완료하고 클라이언트와의 연결을 종료 
    } catch {
        // 파일이 존재하지 않으면 404 응답 전송
        res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
        res.end("404 Not Found");
        // res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
        // res.end("<h1>404 Not Found</h1><script>alert('!!!');</script>");
    }
}

/**
 * 파일 확장자에 따른 MIME 타입을 반환하는 함수 
 *
 * @param {string} filePath 
 * @returns {string} MIME 타입  
 */
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

/**
 * HTTP 요청을 처리하는 메인 함수 (라우팅 역할)
 * 모든 응답에 HSTS 헤더를 추가해 HTTPS 연결을 강제함 
 *
 * @export
 * @async
 * @param {import('http').IncomingMessage} req - 요청 객체
 * @param {import('http').ServerResponse} res - 응답 객체 
 */
export async function handleRequest(req, res) {
    // 모든 응답에 Content Security Policy(CSP) 헤더 적용 
    applyCSP(res);


    // HSTS 헤더 설정, 브라우저에 1년간 HTTPS 사용 강제, 서브도메인 포함, preload 옵션 적용
    // 왜 HSTS를 구현하는가?
    // HTTPS 연결 사용을 강제해 중간자 공격과 프로토콜 다운그레이드 공격 방지 
    // 실수로 HTTP로 접속할 경우 브라우저가 자동으로 HTTPS로 전환해줌
    // 모든 서브도메인에도 동일한 보안 정책을 적용할 수 있어 전체 도메인 보안 강화 
    res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000l; includeSubDomains; preload"
    );

    const { method, url } = req; // 요청의 HTTP 메서드(GET, POST 등)와 URL 가져오기

    // GET 요청 처리
    if (method === "GET") {
        // 루트 경로('/') 요청시 index.html 반환
        if (url === "/") {
            return serveStaticFile(req, "./public/index.html", res);
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
            return serveStaticFile(req, "." + url, res);
            // return serveStaticFile(url, res);
        }

        // 특정 API 요청이 아니라면 기본 응답 반환
        res.writeHead(200, { "Content-Type": "text/plain; charset=UTF-8" });
        // curl https://localhost:443/hello
        res.end("서버가 정상적으로 작동 중입니다.");
    }
    // 허용되지 않은 HTTP 메서드 처리
    else {
        // 서버에서 허용하지 않은 HTTP 메서드를 사용한 경우 
        res.writeHead(405, { "Content-Type": "text/plain; charset=UTF-8" });
        // curl -X POST https://localhost:443/
        res.end("허용되지 않은 요청 방식입니다.");
    }
}