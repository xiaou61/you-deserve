# 题目质检 Batch 25：网络 HTTP、DNS 与 gRPC 241-250

审查时间：2026-05-04  
范围：按文件路径排序后的第 241-250 道题，`content/questions/network/cdn.md` 至 `content/questions/network/http-cache.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 CDN、Cookie/Session/Token、CORS、DNS 缓存、DNS 解析、正向/反向代理、GET/POST、gRPC/REST、gRPC 流式调用和 HTTP 缓存。`dns-resolution.md` 和 `get-post.md` 的正文较好，能把流程和语义讲清；其余题多数有正确短答案，但 `详细讲解` 仍有通用模板污染，协议级字段、请求头、缓存策略、浏览器安全限制和排障方法不足。

- 8 篇命中通用详解模板：除 `dns-resolution.md`、`get-post.md` 外，其余均有模板化段落。
- 3 篇存在重复 `## 图解提示`：`dns-cache.md`、`forward-proxy-reverse-proxy.md`、`grpc-streaming.md`。
- 图解节点截断明显：`Access-Contr...`、`Java 进程可能有独立...`、`Bidirectiona...`、`Server strea...`，HTTP 缓存图解还有两个都叫 `常见头` 的节点。
- 安全相关题需要更严谨：Cookie/Session/Token 和 CORS 不能只讲概念，还要讲 XSS、CSRF、SameSite、Credentials、Origin 白名单和 `Vary: Origin`。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/network/cdn.md` | 方向正确，链路和缓存键不足 | P2 | CDN 缓存静态资源、降低延迟、减轻源站压力这些正确。建议补 CNAME 调度、边缘节点、回源、缓存命中/未命中、Cache Key、TTL、刷新和预热、文件名 hash、Range 请求、HTTPS 证书和源站保护；动态内容要区分普通缓存、边缘计算和接口级短缓存。 |
| 2 | `content/questions/network/cookie-session-token.md` | 概念正确，安全细节不足 | P1 | Cookie 是浏览器存储机制、Session 是服务端会话、Token 是访问凭证，这个分工正确。但题目涉及登录安全，不能只停在概念。建议补 HttpOnly、Secure、SameSite、Path/Domain、过期时间、Session 固定攻击、CSRF/XSS 风险、JWT 与 opaque token、Refresh Token、撤销和轮换策略，以及 Token 放 Header 还是 Cookie 的权衡。 |
| 3 | `content/questions/network/cors.md` | 方向正确，预检和凭证边界不足 | P1 | “CORS 是浏览器安全策略，服务端通过响应头授权跨源访问”正确。但正文没有展开简单请求/非简单请求、OPTIONS 预检、`Access-Control-Allow-Methods`、`Access-Control-Allow-Headers`、`Access-Control-Allow-Credentials`、`Access-Control-Max-Age`。建议补 Origin 白名单、带 Cookie 时不能用 `*`、需要加 `Vary: Origin`、CORS 不是认证授权机制。 |
| 4 | `content/questions/network/dns-cache.md` | 方向正确，层级和负缓存不足 | P1 | TTL、服务迁移、故障切流、Java 进程独立 DNS 缓存这些方向对，但详解模板化，重复 `## 图解提示`。建议补浏览器、OS、应用运行时、本地递归 DNS、权威 DNS 多层缓存；补负缓存、运营商劫持或污染、TTL 过长导致切流慢、TTL 过短导致权威压力；排查应区分 `dig @resolver`、本机缓存、应用进程缓存和权威记录。 |
| 5 | `content/questions/network/dns-resolution.md` | 正文质量较好 | P2 | 浏览器缓存、系统缓存、hosts、本地 DNS、根域、顶级域、权威 DNS 的流程讲得清楚，也区分了 UDP/TCP 和 TTL。建议补递归查询与迭代查询的角色差异、A/AAAA/CNAME 记录、CDN CNAME 调度、DNSSEC/DoH/DoT 作为扩展了解，以及解析成功但连接失败时要继续查 TCP/TLS/路由。 |
| 6 | `content/questions/network/forward-proxy-reverse-proxy.md` | 基础正确，代理工程细节不足 | P2 | “正向代理代表客户端，反向代理代表服务端入口”这个判断标准清楚。但重复 `## 图解提示`，详解后半段泛。建议补 Nginx 反向代理的 TLS 终止、负载均衡、健康检查、缓存、限流、`Host`、`X-Forwarded-For`、`X-Forwarded-Proto`；正向代理则补访问控制、出口 IP、认证和审计。 |
| 7 | `content/questions/network/get-post.md` | 正文质量较好 | P2 | 从 HTTP 语义、安全、幂等、参数位置、缓存和接口设计讲 GET/POST，比只背“URL/body”好。建议补 URL 长度是浏览器/服务器实现限制而不是协议硬规则；POST 也可以通过幂等键做到幂等；GET 不应产生副作用，否则会被缓存、预取或重试放大风险；敏感信息不要放 URL，因为日志和 Referer 可能泄露。 |
| 8 | `content/questions/network/grpc-rest.md` | 方向正确，服务治理不足 | P2 | REST 偏资源和 HTTP 语义，gRPC 偏接口契约、HTTP/2、Protobuf 和高性能服务间调用，这些正确。建议补 gRPC 的 deadline、取消、状态码、重试、负载均衡、服务发现、可观测性和浏览器限制；REST 则补 OpenAPI、缓存、网关、调试友好性和对外开放生态。 |
| 9 | `content/questions/network/grpc-streaming.md` | 四种模式正确，流控细节不足 | P1 | Unary、Server streaming、Client streaming、Bidirectional streaming 四种模式正确，但正文模板化，追问占位，重复 `## 图解提示`。建议补 proto 定义里的 `stream` 位置、HTTP/2 stream、消息有序性、flow control、背压、deadline/cancel、半关闭、错误传播，分别举“日志推送、上传分片、聊天/协作”场景。 |
| 10 | `content/questions/network/http-cache.md` | 方向正确，缓存头细节不足 | P1 | 强缓存、协商缓存、`Cache-Control`、`ETag`、`Last-Modified` 方向正确。但详解仍泛，图解节点重复 `常见头`。建议补 `max-age`、`s-maxage`、`no-cache`、`no-store`、`public/private`、`immutable`、`Vary`、`Age`、304 流程、ETag 强弱校验、CDN 与浏览器缓存差异、静态资源 hash 和 HTML 不长缓存的组合策略。 |

## 优先修复建议

1. 先修 `dns-cache.md`、`forward-proxy-reverse-proxy.md`、`grpc-streaming.md` 的重复 `## 图解提示`，并修 CORS/gRPC/HTTP 缓存图解节点截断。
2. 浏览器安全题统一补头字段和攻击模型：CORS、Cookie、Token、缓存都需要讲清 XSS/CSRF、凭证携带、Origin 白名单和缓存泄露风险。
3. DNS 题要串起来：解析流程、缓存层级、TTL、CNAME/CDN、故障切流和应用进程缓存不要分散成互不相干的碎片。
4. gRPC 题需要补 HTTP/2 的流、流控、deadline、取消和错误传播，否则“流式调用”只剩四个名词。
5. HTTP 缓存和 CDN 题要补真实缓存头和 Cache Key，否则很难指导前端静态资源、接口缓存和 CDN 回源治理。
