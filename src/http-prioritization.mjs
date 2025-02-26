// src\http-prioritization.mjs
// HTTP 요청 큐잉과 스케줄링 로직 구현
// 웹페이지 로딩시 여러 리소스가 동시에 요청되는데 중요도가 높은 리소스를 우선적으로 처리하기 위함
// HTTP/2나 HTTP/3에서는 네이티브 우선순위 지원이 있음
// 클라이언트가 요청 헤더 'x-priority'를 통해 우선순위를 지정할 수 있으며
// 기존 우선순위 값은 5로 설정되고 낮은 숫자일수록 높은 우선순위를 의미함

import { handleRequest } from "./handler.mjs";

// 요청 큐를 저장할 배열 (각 항목은 {req, res, priority} 형태)
const requestQueue = [];
// 현재 요청을 처리 중인지 여부
let processing = false;

/**
 * 새 HTTP 요청을 우선순위 큐에 추가 
 *
 * @export
 * @param {import('http').IncomingMessage} req - 클라이언트 요청 객체 
 * @param {import('http').ServerResponse} res - 서버 응답 객체 
 */
export function addRequest(req, res) {
    // 요청 헤더 'x-priority'가 있으면 파싱, 없으면 기본값 5
    const priority = parseInt(req.headers["x-priority"]) || 5;
    // 큐에 추가
    requestQueue.push({ req, res, priority });
    // 우선순위(낮은 값 우선) 기준으로 정렬 
    requestQueue.sort((a, b) => a.priority - b.priority);
    // 큐 처리 시작 
    processQueue();
}

/** 큐에 있는 요청을 순차적으로 처리함 */
function processQueue() {
    // 이미 요청을 처리 중이면 대기 
    if (processing) {
        return;
    }
    // 처리할 요청이 없으면 종료 
    if (requestQueue.length === 0) {
        return;
    }

    processing = true;
    const { req, res, priority } = requestQueue.shift();
    console.log(`처리 중인 요청 (우선순위: ${priority})`);

    // 요청 처리 (handleRequest가 Promise를 반환하므로 async/await 사용)
    handleRequest(req, res)
        .catch(error => {
            console.error("요청 처리중 오류 발생: ", error);
            res.writeHead(500, { "Content-Type": "text/plain; charset=UTF-8" });
            res.end("서버 내부 오류 발생");
        })
        .finally(() => {
            processing = false;
            // 다음 요청 처리 
            processQueue();
        });
}