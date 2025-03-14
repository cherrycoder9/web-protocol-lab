// src\grpc-server.mjs
// @grpc/grpc-js와 @grpc/proto-loader를 사용해 gRPC 서버 구현
// gRPC 서버는 프로토콜 버퍼 파일을 로드한 후
// 간단한 Greeter 서비스를 제공하도록 설정됨

// # gRPC를 구현했을때의 장점
// HTTP/2를 기반으로 다중 스트림, 헤더 압축, 서버 푸시 등을 지원해 REST보다 빠르고 효율적
// 클라이언트와 서버 모두 실시간 스트리밍 통신이 가능해 다양한 애플리케이션에 적합함
// Protocol Buffers를 사용해 인터페이스가 명확하고 자동으로 문서화되며 클라이언트와 서버간 데이터 형식 불일치를 줄여줌
// 서비스 정의가 명확하기 때문에 대규모 시스템에서 여러 서비스 간의 통신을 효과적으로 관리할 수 있음 

import { Server, ServerCredentials, loadPackageDefinition } from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";

// 프로토콜 버퍼 파일의 경로를 정의
const PROTO_PATH = path.resolve("proto", "helloworld.proto");

// proto-loader 옵션 설정, proto 파일을 로드할 때의 설정
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, // 필드명을 proto 파일과 동일하게 유지
  longs: String, // 64비트 정수를 문자열로 변환
  enums: String, // 열거형을 문자열로 변환
  defaults: true, // 기본값을 설정
  oneofs: true // oneof 필드를 활성화 
});

// 로드한 정의를 기반으로 gRPC 패키지를 생성
const helloPackage = loadPackageDefinition(packageDefinition).helloworld;

/**
 * Greeter 서비스의 SayHello 메서드 구현
 * 클라이언트로부터 받은 요청에서 name을 추출해 인사 메시지 반환 
 *
 * @param {Object} call - gRPC call 객체, 클라이언트 요청 데이터를 포함 
 * @param {Function} callback - 응답을 보내기 위한 콜백 함수 
 */
function sayHello(call, callback) {
  const { name } = call.request;
  console.log(`gRPC 요청 수신 - name: ${name}`);
  // 클라이언트에게 인사 메시지 응답
  callback(null, { message: `Hello, ${name}!` });
}

export function startGRPCServer() {
  // 새로운 gRPC 서버 인스턴스 생성 
  const grpcServer = new Server();

  // Greeter 서비스와 그 구현체를 gRPC 서버에 추가함
  grpcServer.addService(helloPackage.Greeter.service, { SayHello: sayHello });

  // 서버를 포트 50051에 바인딩 (개발 및 테스트용으로 보안 없이 실행)
  const GRPC_PORT = "0.0.0.0:50051";
  grpcServer.bindAsync(
    GRPC_PORT,
    ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("gRPC 서버 바인딩 실패:", error);
        return;
      }
      // 바인딩 성공후 서버 시작
      // grpcServer.start(); // 1.10.x 버전부터 불필요함 
      console.log(`gRPC 서버가 포트 ${port}에서 실행 중입니다.`);
    });
}

