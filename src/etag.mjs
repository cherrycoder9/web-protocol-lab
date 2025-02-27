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
    // 이외에도 SHA-256, SHA-384, SHA-512, MD5, RIPEMD-160 등 사용가능 
    console.log(crypto.getHashes()); // 현재 시스템에서 사용가능한 해시알고리즘 목록
    // update(data): 해시 계산에 사용할 데이터를 해시 객체에 추가함
    // 여러번 호출할 수 있어서 큰 데이터를 여러 조각으로 나눠 처리할때 유용 
    // digest(encoding): update()로 추가된 모든 데이터를 바탕으로 최종 해시값 계산
    // 지정한 인코딩으로 결과를 반환함. 호출후 해시 객체는 재사용 불가
    // hex: 16진수 인코딩, 해시 결과의 각 바이트를 0~F의 두자리 문자열로 표현 
    // 예를들어, 버퍼내용이 [15, 255]라면 '0fff'와 같이 출력됨 
    // base64: 6비트 단위로 데이터를 분할해 알파벳, 숫자, '+', '/' 같은 문자를 사용해 표현 
    // latin1(또는 binary): 해시 결과를 단일 바이트 문자열로 반환함 
    // 각 문자가 0~255 범위의 값을 가지며 주로 이진 데이터를 그대로 표현할때 사용 
    // 인코딩을 지정하지 않으면, digest()는 결과를 Buffer 객체로 반환함 
    const hash = crypto.createHash('sha1').update(data).digest('hex');
    // 해시값을 큰따옴표로 감싸서 ETag 형식에 맞춤
    return `"${hash}"`;
}