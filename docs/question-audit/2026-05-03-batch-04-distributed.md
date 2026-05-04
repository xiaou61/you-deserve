# 题目质检 Batch 4：分布式 31-40

审查时间：2026-05-03  
范围：排序后的第 31-40 道题，`content/questions/distributed/load-balancing-algorithms.md` 至 `content/questions/distributed/sentinel-circuit-breaker.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批的基础答案普遍没有明显硬伤，尤其 `rate-limiter`、`rpc-timeout-retry`、`seata-at-transaction`、`sentinel-circuit-breaker` 的前半段已经具备较好的面试骨架。主要问题仍集中在自动扩展段落：

- 10 道题都出现了不贴题的通用工程模板，尤其是 `生产者 -> Broker/注册中心 -> 消费者 -> 数据库 -> 补偿任务`、`死信处理`、`人工重放`、`消息堆积`。这套话术对 RPC 序列化、负载均衡、配置中心、Raft、限流、Sentinel 熔断都不合适。
- 7 篇存在重复 `## 图解提示`：`nacos-config-center`、`nacos-service-discovery`、`raft-basic`、`rpc-serialization-protocol`、`saga-transaction`、`seata-at-transaction`、`sentinel-circuit-breaker`。
- 多个图解节点被截断，如 `Leader 负责接收写请求并复制日…`、`Seata 代理数据源记录 befo…`、`服务提供者启动后向 Nacos 注册…`，这会直接影响后续 AI 生成图解。
- 高阶题的专项细节还不够：Nacos 缺少 namespace/group/dataId、长轮询、本地快照；Raft 缺少选举过程、日志匹配、安全规则；Sentinel 缺少 slow request ratio/error ratio/error count 规则和半开恢复；Seata 缺少 TC/TM/RM、全局锁和脏回滚细节。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/distributed/load-balancing-algorithms.md` | 主体正确，工程验证跑题 | P2 | 轮询、随机、加权轮询、最少连接、一致性哈希讲得准确。建议补健康检查、摘除坏节点、慢启动、权重动态调整、会话保持与缓存亲和性。`实战落地` 不应讲死信和人工重放，应改为请求分布、实例负载、错误率、连接数、热点实例和健康检查指标。 |
| 2 | `content/questions/distributed/nacos-config-center.md` | 基础可用，Nacos 专项细节不足 | P1 | 配置中心价值讲得对，但需要补 Nacos 的 namespace/group/dataId、配置监听、长轮询、本地快照、动态刷新范围、灰度配置、回滚和权限审计。当前把配置中心按 Broker/消费者链路回答是明显跑题；重复 `图解提示` 需要合并。 |
| 3 | `content/questions/distributed/nacos-service-discovery.md` | 流程正确，边界需要补强 | P1 | 注册、发现、本地缓存、心跳剔除方向正确。建议补临时实例/持久实例、健康检查、服务订阅推送、保护阈值、namespace/group/cluster、注册中心不可用时的本地缓存兜底。图解节点 `服务提供者启动后向 Nacos 注册…` 被截断，且存在重复 `图解提示`。 |
| 4 | `content/questions/distributed/raft-basic.md` | 入门正确，但高阶题深度不足 | P1 | Leader/Follower/Candidate、多数派提交、term 这些点正确。建议补随机选举超时、投票规则、AppendEntries、日志匹配原则、leader completeness、安全提交规则、脑裂如何被 term 和多数派约束。`常见追问` 现在只有复制句，远不够；图解节点 `复制日…` 截断，且重复 `图解提示`。 |
| 5 | `content/questions/distributed/rate-limiter.md` | 主体较好，模板段需删除 | P2 | 固定窗口、滑动窗口、漏桶、令牌桶解释清楚，`详细讲解` 前半段也有落地价值。建议补分布式限流的 Redis Lua 原子性、本地预分配令牌、热点 key、fail open/fail closed、限流命中率和误伤率。`实战落地` 的 MQ 链路应替换为限流专项链路。 |
| 6 | `content/questions/distributed/rpc-serialization-protocol.md` | 概念正确，兼容和安全可加强 | P1 | 对性能、体积、兼容性、跨语言、可读性的解释正确。建议补 Protobuf 字段编号兼容规则、JSON/Hessian/Kryo/Protobuf 的典型取舍、Java 原生反序列化安全风险、schema 演进和灰度升级。当前死信、Broker、人工重放完全不适合序列化协议题；重复 `图解提示` 应清理。 |
| 7 | `content/questions/distributed/rpc-timeout-retry.md` | 主体质量较好，实战段过泛 | P2 | 超时、重试、幂等、退避、抖动、整体超时预算讲得对。建议补按调用链分配 deadline、单次超时小于整体预算、只对可恢复错误重试、最大重试次数、重试放大系数、hedged request 的适用风险。`实战落地` 应围绕调用耗时、重试次数、熔断打开率和下游错误率。 |
| 8 | `content/questions/distributed/saga-transaction.md` | 核心正确，但追问太浅 | P1 | Saga 的正向步骤、补偿步骤、编排式/协同式、状态机都提到了。需要补补偿幂等、补偿失败处理、人工介入、事件乱序、业务可补偿性评估，以及编排式和协同式的优缺点。`常见追问` 只是复制机制句，`图解提示` 重复。 |
| 9 | `content/questions/distributed/seata-at-transaction.md` | 主体较好，Seata 机制还可更精确 | P1 | AT 两阶段、before/after image、undo log、全局失败回滚讲得较好。建议补 TC/TM/RM 角色、全局锁、脏写/脏回滚校验、undo log 表、分支事务状态、复杂 SQL 限制、长事务和热点行冲突。图解节点 `befo…` 截断，重复 `图解提示` 需要清理。 |
| 10 | `content/questions/distributed/sentinel-circuit-breaker.md` | 基础正确，Sentinel 专项不足 | P1 | 熔断和降级的区别、慢调用比例、异常比例、异常数、半开探测都讲到了。建议补 Sentinel 的熔断恢复状态、统计窗口、最小请求数、慢调用阈值、blockHandler/fallback 区别、和流控/热点参数/系统保护的边界。当前实战段套 MQ 链路，图解重复。 |

## 优先修复建议

1. 把这一批的 `实战落地` 统一按题目专项重写：负载均衡看实例分布和健康检查，Nacos 看配置/注册链路，Raft 看 term 和多数派，RPC 看调用耗时和序列化指标，事务看状态机和补偿，Sentinel 看规则命中和恢复探测。
2. 先修 P1 高阶题：`raft-basic`、`seata-at-transaction`、`saga-transaction`、`sentinel-circuit-breaker`，这些题如果只停在定义层，会明显撑不住二面追问。
3. 批量清理重复 `图解提示`，并把所有截断节点补成完整短句。
4. `nacos-config-center` 和 `nacos-service-discovery` 应分清配置中心与注册中心：前者讲 dataId/group/namespace/监听/快照，后者讲实例注册/订阅/心跳/保护阈值。
5. `rate-limiter` 和 `gateway-rate-limiter` 内容相近，后续修正文案时要区分：一个讲算法原理，一个讲网关落地维度和分布式实现。
