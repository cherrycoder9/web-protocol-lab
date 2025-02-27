// src\etag.mjs
import crypto from "node:crypto";

// ETag(Entity Tag)는 HTTP 응답 헤더의 일종
// 리소스의 버전을 식별하는 고유 식별자를 제공함
// 캐싱 최적화, 대역폭 절약 및 성능개선, 일관된 데이터 검증 등의 장점이 있음
// 클라이언트가 이전에 받은 파일의 ETag를 "If-None-Match" 헤더에 포함시켜 조건부 요청을 할수있음
// 서버는 파일이 변경되지 않은 경우 304 Not Modified 응답을 보내 데이터 전송을 절약

/**
 * 주어진 데이터에 대해 ETag를 생성하는 함수
 * SHA-1 해시 알고리즘을 사용해 파일 내용의 해시 값 계산
 * HTTP Etag 규격에 맞춰 큰따옴표로 감싸서 반환 
 *
 * @export
 * @param {Buffer} data - 파일의 내용 
 * @returns {string} - 생성된 ETag
 */
export function generateETag(data) {
    // 파일 데이터의 SHA-1 해시를 계산
    const hash = crypto.createHash('sha1').update(data).digest('hex');
    // 해시값을 큰따옴표로 감싸서 ETag 형식에 맞춤
    return `"${hash}"`;
}