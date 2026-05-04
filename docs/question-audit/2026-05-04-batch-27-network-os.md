# 题目质检 Batch 27：网络收尾与操作系统机制 261-270

审查时间：2026-05-04  
范围：按文件路径排序后的第 261-270 道题，`content/questions/network/tcp-udp.md` 至 `content/questions/os/linux-ebpf.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批从 TCP/UDP、TLS、WebSocket 过渡到 OS 的上下文切换、死锁、epoll、IO 多路复用、cgroup 和 eBPF。`tcp-udp.md`、`context-switch.md`、`deadlock.md`、`io-multiplexing.md` 的正文质量较好；TLS、WebSocket、epoll、cgroup、eBPF 这些更偏工程排障和内核机制的题，短答案方向正确，但详解仍有模板味，需要补协议报文、系统调用、内核对象、观测命令和生产限制。

- 6 篇命中通用详解模板：`tls-handshake.md`、`tls13-vs-tls12.md`、`websocket.md`、`epoll.md`、`linux-cgroup.md`、`linux-ebpf.md`。
- 3 篇存在重复 `## 图解提示`：`tls13-vs-tls12.md`、`linux-cgroup.md`、`linux-ebpf.md`。
- 图解节点截断集中在 TLS 和 Linux 专题：`TLS 1.3 通常 1...`、`Bidirection...`、`cgroup 可以限制...`、`bcc、b...`。
- 这一批最需要补的是“怎么落地验证”：TLS 看握手和证书，WebSocket 看升级头和心跳，epoll 看系统调用模型，cgroup/eBPF 看容器指标和工具链。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/network/tcp-udp.md` | 正文质量较好 | P2 | TCP 连接管理、可靠有序字节流、流控/拥塞控制，UDP 无连接、保留报文边界、延迟和控制自由度更高，这些讲得比较完整。建议补 QUIC 作为基于 UDP 实现可靠传输的典型例子、UDP 应用层可靠性设计、TCP 粘包/拆包处理、DNS/音视频/游戏协议的取舍。 |
| 2 | `content/questions/network/tls-handshake.md` | 方向正确，握手步骤过粗 | P1 | “证书验证身份并协商对称密钥”正确，但详解模板化。建议补 ClientHello、ServerHello、SNI、ALPN、证书链、密钥交换、Finished、会话恢复这些步骤；区分 TLS 1.2 和 TLS 1.3 握手差异；补证书过期、域名不匹配、链不完整、弱协议和抓包排查方式。 |
| 3 | `content/questions/network/tls13-vs-tls12.md` | 核心正确，安全边界不足 | P1 | 1-RTT、0-RTT、移除 RSA 静态密钥交换、加密套件更少更安全，这些方向正确。但正文模板化，重复 `## 图解提示`。建议补 TLS 1.3 默认前向安全、删除旧算法和压缩、更多握手内容被加密、0-RTT 可重放所以只适合幂等请求、证书和中间盒兼容风险、如何通过浏览器/openssl 确认协议版本。 |
| 4 | `content/questions/network/websocket.md` | 基础正确，协议升级和治理不足 | P1 | “HTTP 握手升级、建立后长连接、全双工、适合实时聊天/通知/行情”方向正确。建议补 `Upgrade: websocket`、`Connection: Upgrade`、`Sec-WebSocket-Key`/`Sec-WebSocket-Accept`、`ws/wss`、Frame、ping/pong、断线重连、心跳超时、鉴权、负载均衡粘性会话、背压和消息顺序。 |
| 5 | `content/questions/os/context-switch.md` | 正文质量较好 | P2 | 寄存器、程序计数器、栈指针、调度信息、TLB/cache 影响、线程数过多导致切换成本上升都讲到了。建议补自愿/非自愿上下文切换、用户态/内核态切换、`vmstat`、`pidstat -w`、`perf sched` 等观测方法，以及锁竞争和 IO 阻塞如何导致切换数飙升。 |
| 6 | `content/questions/os/deadlock.md` | 正文质量较好 | P2 | 四个必要条件、破坏条件、固定资源顺序、锁超时、数据库等待图等讲得完整。建议补等待图检测、tryLock 超时退避、锁粒度和持锁时间、死锁与饥饿/活锁区别，以及工程上如何用线程 dump 或数据库死锁日志定位等待环。 |
| 7 | `content/questions/os/epoll.md` | 方向正确，内核接口细节不足 | P1 | “事件驱动、就绪列表、避免每次线性扫描所有 fd、LT/ET”方向正确，但正文模板化。建议补 `epoll_create`、`epoll_ctl`、`epoll_wait` 三个核心调用；补 interest list、ready list、非阻塞 fd、ET 模式必须循环读到 `EAGAIN`、`EPOLLONESHOT`、惊群问题，以及和 select/poll 的拷贝与扫描差异。 |
| 8 | `content/questions/os/io-multiplexing.md` | 正文质量较好 | P2 | 阻塞 IO、select、poll、epoll 的演进和差异讲得比较清楚。建议补 Reactor 模型、fd 就绪不等于业务处理完成、非阻塞 IO 与多路复用的配合、epoll ET 写错导致事件丢失、连接很多但活跃连接少是典型优势场景。 |
| 9 | `content/questions/os/linux-cgroup.md` | 方向正确，容器指标不足 | P1 | “限制、统计和隔离进程组资源，是容器资源控制基础”正确，但详解模板化，重复 `## 图解提示`。建议补 cgroup v1/v2、cpu/memory/io/pids controllers、CPU quota/throttling、memory limit/OOM Kill、Kubernetes requests/limits 与 cgroup 的关系、cgroupfs 路径、容器内外指标差异和 PSI。 |
| 10 | `content/questions/os/linux-ebpf.md` | 方向正确，工具链和 Hook 点不足 | P1 | “在内核安全运行小程序，用于低侵入观测网络、系统调用和性能热点”正确，但正文模板化，重复 `## 图解提示`。建议补 verifier、maps、kprobe、uprobe、tracepoint、perf event、XDP、tc、bcc、bpftrace、Cilium、CO-RE；补采样开销、内核版本、权限、生产启停和数据量控制。 |

## 优先修复建议

1. 先修 `tls13-vs-tls12.md`、`linux-cgroup.md`、`linux-ebpf.md` 的重复 `## 图解提示`，并把 TLS、cgroup、eBPF 的图解改成真实流程或内核对象图。
2. TLS 和 WebSocket 题统一补真实握手字段：ClientHello/ServerHello、证书链、SNI/ALPN、Upgrade、Sec-WebSocket-Key、ping/pong。
3. epoll 与 IO 多路复用要统一接口模型：select/poll/epoll、interest list、ready list、LT/ET、非阻塞读写和 Reactor。
4. Linux 容器与排障题要补命令和观测：cgroupfs、Kubernetes limits、`vmstat`、`pidstat`、bcc/bpftrace、perf、PSI。
5. 高质量 OS 基础题可以作为模板，但要补实际排查入口，避免只停留在教材概念。
