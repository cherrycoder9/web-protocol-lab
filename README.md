# Personal Web Server Implementation Practice

---

## Server Execution

```powershell
node src/server.mjs
```

## Browser Access

```powershell
https://localhost:443
```

## Implemented Features

- [x] Asynchronous I/O
- [x] HTTPS
- [x] HSTS (HTTP Strict Transport Security)
- [x] TLS 1.3
- [x] OCSP Stapling
- [x] Zero-RTT (0-RTT)
- [x] HTTP Prioritization
- [x] Rate Limiting
- [x] CORS
- [x] Content Security Policy (CSP)
- [x] Trusted Types (Enhanced CSP)
- [x] ETag
- [x] Caching (Cache-Control)
- [x] Zstd
- [x] gRPC Support

## Not Implemented Features

- [ ] WebTransport
- [ ] DNS over HTTPS (DoH)
- [ ] DoT (DNS over TLS)
- [ ] Oblivious HTTP
- [ ] QUIC-LB
- [ ] HTTP/3 over Tor
- [ ] Private Access Tokens
- [ ] Server-Sent Events
- [ ] Adaptive Bitrate Streaming (ABR)
- [ ] Network Error Logging (NEL)
- [ ] POST QUIC
- [ ] IPFS Gateway
- [ ] Signed Exchanges (SXG)
- [ ] MASQUE
- [ ] Oblivious DoH
- [ ] Privacy Pass
- [ ] HTTP/3 Prioritized Stream Cancellation
- [ ] QUIC Spin Bit
- [ ] Proxying WebTransport over HTTP/3
