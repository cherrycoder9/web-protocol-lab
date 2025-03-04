// src\zstd.mjs
import { promisify } from "node:util";
import zlib from "node:zlib";

/**
 * Zstd 압축을 수행하는 비동기 함수 
 * 
 * @param {Buffer} data - 압축할 데이터 버퍼 
 * @param {object} [options={}] - Zstd 압축 옵션 
 * @returns {Promise<Buffer>} - 압축된 데이터 버퍼 
 */
const zstdCompressAsync = zlib.zstdCompress
    ? promisify(zlib.zstdCompress)
    /* eslint-disable no-unused-vars */
    : async (data, _options = {}) => {
        console.warn("zlib.zstdCompress를 현재 Node.js에서 이용할수 없어 압축패스.");
        return data;
    };

export async function compress(data, options = {}) {
    try {
        return await zstdCompressAsync(data, options);
    } catch (error) {
        console.error("Zstd 압축 실패: ", error);
        throw error;
    }
}

const zstdDecompressAsync = zlib.zstdDecompress
    ? promisify(zlib.zstdDecompress)
    /* eslint-disable no-unused-vars */
    : async (data, _options = {}) => {
        console.warn("사용불가, 스킵함");
        return data;
    };
export async function decompress(data, options = {}) {
    try {
        return await zstdDecompressAsync(data, options);
    } catch (error) {
        console.error("Zstd 압축해제 실패: ", error);
        throw error;
    }
}