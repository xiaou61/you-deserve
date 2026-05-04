# 题目质检 Batch 26：HTTP 演进与 TCP 机制 251-260

审查时间：2026-05-04  
范围：按文件路径排序后的第 251-260 道题，`content/questions/network/http-https.md` 至 `content/questions/network/tcp-time-wait.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 HTTP/HTTPS、Keep-Alive、Range、状态码、HTTP/2/3、TCP 四次挥手、Nagle/Delayed ACK、TCP 可靠传输、三次握手和 TIME_WAIT。`http-https.md`、`http-status-codes.md`、`http2-http3.md`、`tcp-four-way-wave.md`、`tcp-reliable.md`、`tcp-three-way-handshake.md` 的正文质量较好，能讲出机制和边界；`http-keep-alive.md`、`http-range-request.md`、`tcp-nagle-delayed-ack.md`、`tcp-time-wait.md` 仍有明显模板化，需要补协议字段、状态机和线上排查手段。

- 4 篇命中通用详解模板：`http-keep-alive.md`、`http-range-request.md`、`tcp-nagle-delayed-ack.md`、`tcp-time-wait.md`。
- 3 篇存在重复 `## 图解提示`：`http-range-request.md`、`tcp-nagle-delayed-ack.md`、`tcp-time-wait.md`。
- 图解节点截断集中在 Range 和 TCP 小包题：`Content-Rang...`、`TCP_NODE...`、`等待 2MSL 能让旧连...`，影响协议图可读性。
- TCP 题整体比 MySQL 模板题好，但 TIME_WAIT 和 Nagle/Delayed ACK 这两篇恰好是面试常追线上现象的题，需要补抓包、参数、状态和连接池治理。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/network/http-https.md` | 正文质量较好 | P2 | HTTP 明文、HTTPS 加 TLS、安全层提供加密/认证/完整性、80/443、证书链和对称/非对称协商都讲到了。建议补 TLS 握手过程、SNI、ALPN、HSTS、证书吊销、TLS 1.2/1.3 差异，以及 HTTPS 只能保护传输链路，不能替代应用层鉴权和输入安全。 |
| 2 | `content/questions/network/http-keep-alive.md` | 基础正确，连接池和队头阻塞不足 | P1 | “复用 TCP 连接，减少建连和挥手成本”正确。但正文模板化，缺少 HTTP/1.1 默认长连接、`Connection: close/keep-alive`、服务端 idle timeout、最大请求数、连接池、代理层超时不一致、HTTP/1.1 同连接队头阻塞等细节。建议补如何用连接池指标、TIME_WAIT 数、握手耗时和 upstream keepalive 验证收益。 |
| 3 | `content/questions/network/http-range-request.md` | 方向正确，协议头不完整 | P1 | Range 用于断点续传、视频拖拽，服务端支持时返回 206，这些正确。但重复 `## 图解提示`，详解模板化。建议补 `Range: bytes=start-end`、`Accept-Ranges`、`206 Partial Content`、`Content-Range`、`416 Range Not Satisfiable`、`If-Range`、多段 Range、CDN/对象存储支持，以及 Range 与缓存、压缩传输的关系。 |
| 4 | `content/questions/network/http-status-codes.md` | 正文质量较好 | P2 | 状态码按 1xx/2xx/3xx/4xx/5xx 分类，201/204/304/401/403/409/429 等语义讲得比较清楚。建议补 202 异步处理、206 Range、301/308 与 302/303/307 的方法保持差异、412 条件请求失败、429 的 `Retry-After`，以及“业务错误码和 HTTP 状态码如何配合”。 |
| 5 | `content/questions/network/http2-http3.md` | 正文质量较好 | P2 | HTTP/1.1 文本和连接限制、HTTP/2 二进制帧/多路复用/头部压缩、HTTP/3 基于 QUIC/UDP、解决 TCP 层队头阻塞，这些讲得比较到位。建议补 HPACK/QPACK、QUIC 连接迁移、0-RTT 的重放风险、HTTP/2 Server Push 在现实中的使用边界、浏览器侧 HTTP/3 通常和 TLS 1.3 绑定。 |
| 6 | `content/questions/network/tcp-four-way-wave.md` | 正文质量较好 | P2 | 用全双工解释四次挥手很清楚，也能对比三次握手和 TIME_WAIT。建议补状态流转：FIN_WAIT_1、FIN_WAIT_2、CLOSE_WAIT、LAST_ACK、TIME_WAIT；补 CLOSE_WAIT 堆积常表示应用没有及时 close；补半关闭、RST 和优雅关闭的区别，方便从 `netstat/ss` 排查线上连接问题。 |
| 7 | `content/questions/network/tcp-nagle-delayed-ack.md` | 方向正确，线上现象不足 | P1 | “Nagle 和延迟 ACK 都是减少小包，组合不当会增加交互延迟”正确。但正文模板化、追问占位、重复 `## 图解提示`。建议补 Nagle 的触发条件：有未确认数据时先攒小包；延迟 ACK 的等待策略；二者叠加导致几十毫秒等待的典型交互式小消息场景；`TCP_NODELAY`、`TCP_QUICKACK`、应用层批量写和抓包验证。 |
| 8 | `content/questions/network/tcp-reliable.md` | 正文质量较好 | P2 | 序列号、累计 ACK、超时重传、快速重传、滑动窗口、流量控制、拥塞控制都讲到了，整体完整。建议补 SACK、RTO 估算、快速恢复、校验和、乱序缓存、MSS/MTU 与分片风险，以及业务层仍要处理连接中断、超时和重复提交。 |
| 9 | `content/questions/network/tcp-three-way-handshake.md` | 正文质量较好 | P2 | 三次握手围绕初始序列号、双向收发能力确认和历史重复连接展开，质量较好。建议补 SYN backlog、半连接队列、全连接队列、SYN flood、SYN cookies、第三次 ACK 携带数据的实际限制，以及抓包中 SYN/SYN-ACK/ACK 和状态变化如何对应。 |
| 10 | `content/questions/network/tcp-time-wait.md` | 核心正确，治理细节不足 | P1 | “确保最后 ACK 能被重传、让旧报文自然消失、主动关闭方进入 TIME_WAIT”方向正确。但正文模板化，重复 `## 图解提示`。建议补 2MSL、四元组、端口耗尽、短连接风暴、连接池/Keep-Alive 优先、服务端和客户端谁主动关闭的影响、`SO_REUSEADDR` 与系统参数的风险边界，不要把 TIME_WAIT 简单当成必须消灭的问题。 |

## 优先修复建议

1. 先修 `http-range-request.md`、`tcp-nagle-delayed-ack.md`、`tcp-time-wait.md` 的重复 `## 图解提示` 和截断节点。
2. HTTP 题统一补协议头和状态码证据：Range、Cache、Connection、Retry-After、206/304/416 等字段要能对上真实报文。
3. TCP 状态机题要补 `ss/netstat/tcpdump` 排查视角：握手、挥手、CLOSE_WAIT、TIME_WAIT、小包延迟都可以用抓包或连接状态验证。
4. `tcp-four-way-wave.md`、`tcp-time-wait.md`、`http-keep-alive.md` 三篇要互相统一术语，避免一篇讲 TIME_WAIT 很完整，另一篇又退回泛化模板。
5. HTTP/2/3 与 gRPC 题后续可联动补 HTTP/2 stream、流控、队头阻塞、QUIC 连接迁移和 0-RTT 风险。
