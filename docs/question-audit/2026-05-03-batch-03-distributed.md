# 题目质检 Batch 3：分布式 21-30

审查时间：2026-05-03  
范围：排序后的第 21-30 道题，`content/questions/distributed/distributed-id.md` 至 `content/questions/distributed/leader-election.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批的基础段落比自动扩写段落更可靠。`一句话结论 / 通俗解释 / 面试回答 / 易错点` 多数能覆盖核心概念，但 `详细讲解` 后半段、`实战落地`、`追问准备` 和 `回答模板` 大面积复用同一套模板，导致题目之间差异被抹平。

- 10 道题里大多数都出现了 `生产者 -> Broker/注册中心 -> 消费者 -> 数据库 -> 补偿任务`、`死信处理`、`人工重放`、`消息堆积` 等 MQ 固定话术。对分布式事务、幂等这类题尚有部分相关性，但对分布式 ID、Session、Dubbo 治理、etcd watch/lease、fencing token、网关限流、选主都明显跑题。
- `dubbo-service-governance`、`etcd-watch-lease`、`fencing-token`、`gateway-rate-limiter`、`idempotency-token` 存在重复 `## 图解提示`。`etcd-watch-lease` 的图解节点还出现 `lease 可以给 key 设置 T…`、`实例存…` 这种截断。
- 多篇 `常见追问` 仍是自动生成的空泛问答，如“这个点在项目里怎么落地？”回答只复制一句机制，不能真正承接二面追问。
- 高阶题的关键安全边界需要补强：fencing token 必须由资源方校验单调 token；选主不能只说“抢锁”，还要讲租约、任期、脑裂、旧 leader 写入防护；etcd watch 要讲 revision、compact、断线重拉。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/distributed/distributed-id.md` | 主体较完整，实战段落跑题 | P2 | UUID、数据库号段、Redis 自增、雪花算法的优缺点讲得比较清楚。建议补号段双 buffer、workerId 分配、同毫秒序列耗尽、时钟回拨处理策略和数据库主键类型选择。后半段用消费延迟、死信数量验证分布式 ID 不贴切，应改为重复 ID 监控、发号耗时、号段剩余量、workerId 冲突告警。 |
| 2 | `content/questions/distributed/distributed-session.md` | 基础可用，安全和落地细节不足 | P1 | Redis Session、粘性会话、Session 复制、JWT 的对比方向正确。建议补 Redis 高可用、本地缓存风险、Session 过期续期、踢人/权限变更、JWT 黑名单或 tokenVersion、Cookie 域名/安全属性、Session fixation 防护。当前 `实战落地` 的 Broker/死信/重放模板应删除。 |
| 3 | `content/questions/distributed/distributed-transaction.md` | 核心质量较好，泛化段落需收敛 | P2 | 2PC、TCC、本地消息表、事务消息、Saga 的适用场景基本正确。建议补 2PC 的阻塞和协调者故障、TCC 的空回滚/悬挂/幂等、Saga 补偿不等于数据库回滚、本地消息表的扫描和状态机。MQ 模板在这题部分相关，但仍应按“事务状态、补偿、对账、人工修复”重写，而不是一刀切套生产链路。 |
| 4 | `content/questions/distributed/dubbo-service-governance.md` | 方向正确，但治理细节太浅 | P1 | 注册发现、负载均衡、超时重试、路由灰度、版本分组和降级都提到了。建议补 Dubbo 专项内容：cluster 容错策略如 Failover/Failfast/Failsafe/Failback/Forking，负载均衡策略，接口级/方法级超时配置，重试只适合幂等读，provider 下线和注册中心推送。重复 `图解提示` 和 MQ 模板需要清理。 |
| 5 | `content/questions/distributed/etcd-watch-lease.md` | 高阶点回答过浅 | P1 | watch 和 lease 的定义正确，但 `常见追问` 只是复制原句。建议补 watch 的 revision、断线续看、compact 后要重新 list、前缀监听、事件顺序；lease 要讲 keepalive、TTL 到期删除、服务注册和故障摘除。`图解提示` 有截断节点且重复，实战段也错误套用 Broker/死信。 |
| 6 | `content/questions/distributed/fencing-token.md` | 核心正确，但必须强调资源侧强制校验 | P1 | 过期锁持有者恢复后继续写的例子讲对了。建议补 token 来源需要单调递增且和锁获取具备一致性语义，可用 ZooKeeper zxid、etcd revision、数据库序列等；Redis 锁本身不等于 fencing token。资源方必须保存最大 token 并拒绝旧 token，否则 token 只是在客户端自嗨。重复 `图解提示` 和 MQ 模板需要清理。 |
| 7 | `content/questions/distributed/gateway-rate-limiter.md` | 主体清楚，工程细节可加强 | P1 | 限流维度、令牌桶/漏桶/滑动窗口、超限策略讲得对。建议补 Redis Lua 保证原子性、本地限流 + 全局限流的组合、热点 key、Redis 故障时 fail open/fail closed 的取舍、限流命中率和误伤监控。重复 `图解提示` 和生产者/Broker 模板不适合网关限流。 |
| 8 | `content/questions/distributed/idempotency-token.md` | 关键方向对，但状态机细节不足 | P1 | Token、处理中/成功/失败状态、返回原结果这些点正确。建议补服务端生成 token 与客户端 idempotency-key 的区别，token 绑定用户/业务/参数摘要，唯一索引或 Redis SETNX 只负责占位，还要保存业务结果；处理中超时、失败重试、过期清理和并发首请求抢占要讲清楚。重复 `图解提示` 和 MQ 模板需清理。 |
| 9 | `content/questions/distributed/idempotent-distributed.md` | 概念正确，但和 Token 题区分不够 | P2 | 网络超时、MQ 重复投递、支付回调、重复点击这些场景覆盖到位。建议进一步区分接口幂等、消息消费幂等、支付回调幂等、状态机幂等；说明业务唯一键不能随便生成，最好来自订单号、支付流水号、外部请求号。当前 `实战落地` 过度模板化，应改成按“唯一键、去重表、状态机、原结果返回、对账”组织。 |
| 10 | `content/questions/distributed/leader-election.md` | 核心可用，高可用边界需要补强 | P1 | 选主、脑裂、一致性组件这些基础解释正确。建议补 ZooKeeper 临时顺序节点、etcd lease + revision、Raft term/leader 的区别；Redis/数据库抢锁只能用于要求较低的任务调度，不能泛化为强一致选主。还要讲旧 leader 恢复后的 fencing token/epoch 防护，避免网络分区下继续写。实战段的 MQ 模板应删除。 |

## 优先修复建议

1. 这一批先整体清理 `实战落地` 模板：除分布式事务和幂等可保留“重试/补偿/幂等”外，其他题都不应按 MQ 生产消费链路回答。
2. 高阶题优先补安全边界：`fencing-token` 补资源方单调 token 校验，`leader-election` 补租约/任期/脑裂/旧 leader 防护，`etcd-watch-lease` 补 revision、compact 和重拉。
3. 对 `idempotency-token` 与 `idempotent-distributed` 做差异化：前者聚焦一次请求的 token 状态机，后者聚焦接口、MQ、支付回调、状态流转等广义幂等场景。
4. 清理重复 `图解提示`，尤其 `etcd-watch-lease` 的截断节点；每题只保留一个质量更高的图解描述。
5. `常见追问` 应从泛问改成专项追问，例如 Dubbo 的重试副作用、etcd watch 断线、Session 主动失效、网关限流 Redis 故障、选主脑裂处理。
