# 题目质检 Batch 7：工程化 + Java 61-70

审查时间：2026-05-03  
范围：排序后的第 61-70 道题，`content/questions/engineering/linux-high-memory.md` 至 `content/questions/java/aqs.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批基础短答案大多能用，工程化题对排障和发布稳定性的方向判断基本正确，Java 题的前半段也明显比通用模板更扎实。主要问题集中在三个层面：

- 工程化题的 `实战落地`、`追问准备`、`回答模板` 仍大量套用“数据量或并发量扩大 10 倍”“灰度、压测和回滚策略”等泛化话术，对 Linux、Nginx、可观测性等专项题不够贴题。
- `opentelemetry-three-pillars.md` 的 slug 指向 OpenTelemetry，但正文实际只讲 logs/metrics/traces 三类信号，缺少 OTel 的 SDK、Instrumentation、Collector、Exporter、上下文传播和语义约定，题目定位需要修正或补齐。
- `linux-high-memory`、`linux-network-troubleshooting`、`opentelemetry-three-pillars`、`prometheus-grafana-alerting` 存在重复 `## 图解提示`；`linux-high-memory`、`abstract-class-interface`、`aqs` 的图解节点出现截断省略，影响生成图可读性。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/engineering/linux-high-memory.md` | 主体正确，排查工具需更细 | P2 | 能区分堆内、堆外、page cache、线程栈和容器限制，方向正确。建议补 `jstat`、`jcmd GC.heap_info`、NMT、`pmap`、`smem`、heap dump 风险、cgroup memory limit、OOM killer 日志，以及“RSS 高不一定等于 Java 堆泄漏”。重复 `图解提示`，且图解节点有 `RSS、swap…`、`memory limi…` 这类截断。 |
| 2 | `content/questions/engineering/linux-network-troubleshooting.md` | 排查层次对，命令清单不足 | P2 | DNS、连通性、端口、防火墙、网关、应用日志的分层思路可用。建议补 `dig/nslookup`、`curl -v`、`ss -lntp`、`tcpdump`、`traceroute/mtr`、`iptables/nft`、安全组、容器网络和抓包判断 TCP 三次握手卡在哪。存在重复 `图解提示`，应合并成一张排障流程图。 |
| 3 | `content/questions/engineering/logging-tracing.md` | 基础可用，和可观测性边界需更清楚 | P2 | 日志与追踪的区别讲到了，但建议进一步区分 logs、metrics、traces 的定位方式。可补结构化日志、TraceId/SpanId/ParentId、MDC、异步线程上下文丢失、采样策略、敏感字段脱敏，以及日志量成本控制。后半段仍是通用项目模板，需改成排障链路专项追问。 |
| 4 | `content/questions/engineering/nginx-reverse-proxy.md` | 正文较强，生产边界可补 | P2 | 反向代理、负载均衡、隐藏后端和统一入口讲得比较完整。建议补 `upstream`、`proxy_pass`、`proxy_set_header`、超时配置、keepalive、502/504 排查、真实客户端 IP、TLS 终止，以及开源 Nginx 主动健康检查能力与 Nginx Plus/第三方模块的边界。 |
| 5 | `content/questions/engineering/observability.md` | 方向正确，但过于概念化 | P2 | 可观测性不等于监控的结论正确。建议补 metrics/logs/traces 的互补关系、RED/USE 方法、SLI/SLO/Error Budget、告警疲劳、指标基数成本、看板分层、Runbook 和事故复盘。当前后半段仍像项目设计模板，缺少“如何从告警走到定位”的现场感。 |
| 6 | `content/questions/engineering/opentelemetry-three-pillars.md` | 主题定位偏移，需要重点修 | P1 | 题目标题问日志、指标、链路追踪区别，正文按三大信号回答基本正确；但 slug 是 `opentelemetry-three-pillars`，内容几乎没有 OpenTelemetry 本身。若保留此 slug，应补 OTel SDK、自动/手动埋点、Collector、Exporter、Context Propagation、Semantic Conventions、采样和后端对接；若只讲三类信号，应考虑改 slug 或标题。重复 `图解提示`。 |
| 7 | `content/questions/engineering/prometheus-grafana-alerting.md` | 概念正确，Prometheus 细节不足 | P2 | Prometheus 采集/存储/查询指标、Grafana 可视化、告警通知的分工正确。建议补 exporter、scrape interval、PromQL、label/cardinality、Alertmanager 路由/静默/抑制、记录规则、保留周期和远端存储。重复 `图解提示`，后半段仍套用了“入口流量、异步任务、数据核对”模板。 |
| 8 | `content/questions/engineering/rollback-strategy.md` | 主体准确，回滚不可逆边界可加强 | P2 | 应用、配置、灰度、数据库兼容和数据补偿都讲到了。建议进一步强调向前兼容数据库变更、Expand-Contract、Feature Flag、幂等补偿、回滚决策阈值、回滚演练、数据污染后的修复与审计。当前模板里“容量、权限、一致性”过泛，应改成发布事故场景。 |
| 9 | `content/questions/java/abstract-class-interface.md` | 前半段质量好，后半段被模板污染 | P2 | “抽象类讲身份/骨架，接口讲能力/契约”的解释很好，组合使用也讲得成熟。问题在 `实战落地`、`追问准备`、`回答模板` 混入并发异常、压测、JFR、灰度回滚等无关话术。建议把追问改成默认方法冲突、接口常量、抽象类构造方法、组合优于继承、框架中接口 + 抽象类的搭配。图解节点被截断。 |
| 10 | `content/questions/java/aqs.md` | 主体扎实，源码边界还可补 | P2 | state、CAS、CLH 队列、park/unpark、独占/共享模式、ReentrantLock/Semaphore/CountDownLatch 映射都正确。建议补 `acquire/release` 主流程、Node waitStatus、可中断/超时获取、公平与非公平的 `hasQueuedPredecessors`、Condition 队列与同步队列区别。后半段仍套用“配置不生效、灰度回滚”模板；图解节点有截断。 |

## 优先修复建议

1. 先修 `opentelemetry-three-pillars.md` 的题目定位：要么改成通用“三类可观测性信号”，要么补完整 OpenTelemetry 工程链路。
2. 清理 4 篇重复 `图解提示`，并把 `linux-high-memory`、`abstract-class-interface`、`aqs` 的截断节点改成完整短句。
3. 工程化题的追问应按专项重写：Linux 题问命令和现场保全，Nginx 题问 502/504 和转发头，可观测性题问 SLI/SLO、采样、指标基数和告警疲劳。
4. Java 题保留优质正文，但重写模板化后半段，避免抽象类/AQS 被“业务目标、容量边界、灰度回滚”带偏。
5. 可观测性相关 4 题需要做分工：`logging-tracing` 讲日志与链路，`observability` 讲方法论和闭环，`opentelemetry-three-pillars` 讲 OTel 标准化采集链路，`prometheus-grafana-alerting` 讲指标监控和告警落地。
