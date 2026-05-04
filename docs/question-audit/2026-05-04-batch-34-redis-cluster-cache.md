# 题目质检 Batch 34：Redis Cluster 与缓存专题 331-340

审查时间：2026-05-04  
范围：按文件路径排序后的第 331-340 道题，`content/questions/redis/cache-preheat-degrade.md` 至 `content/questions/redis/redis-cluster-hash-slot.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖缓存预热/降级、Redis Cluster 重定向、内存碎片、Pub/Sub 与 Stream、ACL、缓存三大问题、输出缓冲区、故障转移和 hash slot。`redis-cache-penetration.md` 的主体质量较好，缓存穿透、击穿、雪崩的边界表达清楚；Cluster、ACL、输出缓冲区和 failover 题虽然方向正确，但还停在概念层，需要补命令、参数、状态机和线上排查证据。

- 9 篇命中通用详解模板，只有 `redis-cache-penetration.md` 没有命中“相关问题通常都不是孤立出现”的模板句。
- 5 篇存在重复 `## 图解提示`：`cache-warming.md`、`redis-acl.md`、`redis-client-output-buffer.md`、`redis-cluster-failover.md`、`redis-cluster-hash-slot.md`。
- 图解节点截断集中在 Redis 专有名词：`Redis Cluste...`、`val...`、`key patte...`、`PFAIL...`、`CRC...`。
- Cluster 题要补槽位迁移、ASKING、MOVED 缓存更新、故障投票和配置纪元；运维题要补 `INFO`、`CLIENT LIST`、`MEMORY STATS`、`CLUSTER NODES` 等验证手段。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/redis/cache-preheat-degrade.md` | 方向正确，预热与降级边界不足 | P1 | 预热、限流、关闭非核心功能、本地缓存兜底方向正确，但正文模板化。建议拆清“预热”与“降级”：预热补热点识别、批量加载、TTL 抖动、失败重试、预热进度和回滚；降级补开关平台、默认值、只读模式、核心链路保护、用户体验损失和恢复条件。 |
| 2 | `content/questions/redis/cache-warming.md` | 方向正确，但重复图解且缺执行细节 | P1 | 大促、重启、热门内容提前缓存这些场景可用，但重复 `## 图解提示`。建议补预热来源、预热顺序、并发控制、失败补偿、预热命中率、缓存容量评估、如何避免预热打爆 DB，以及预热完成后的抽样校验。 |
| 3 | `content/questions/redis/cluster-moved-ask.md` | 核心概念有，但 Cluster 迁移细节不足 | P1 | MOVED 是永久重定向、ASK 是迁移过程中的临时重定向，这个核心方向正确。建议补客户端 slot cache、`CLUSTER SLOTS`、`ASKING`、migrating/importing 状态、客户端重试次数、pipeline 跨槽风险、hash tag、以及访问错节点时如何观察 MOVED/ASK。 |
| 4 | `content/questions/redis/memory-fragmentation.md` | 方向正确，指标和参数不足 | P1 | 大 value、频繁修改、主动碎片整理、重启迁移方向正确，但正文模板化且图解 `val...` 截断。建议补 `mem_fragmentation_ratio`、allocator fragmentation、RSS 与 used_memory 区别、jemalloc、`activedefrag` 参数、fork 写时复制风险和判断是否真的需要重启。 |
| 5 | `content/questions/redis/pubsub-vs-stream.md` | 区分方向正确，命令和语义不足 | P2 | Pub/Sub 即时广播、Stream 可持久化和消费组，这个主线正确。建议补 `PUBLISH/SUBSCRIBE`、`XADD/XREAD/XREADGROUP/XACK`、PEL、消息 ID、消息保留、消费确认、重放能力、顺序性、阻塞读取和适用场景边界。 |
| 6 | `content/questions/redis/redis-acl.md` | 方向正确，权限模型不足 | P1 | 多用户、命令类别、key pattern、共享 Redis 权限隔离方向正确，但重复 `## 图解提示` 且节点截断。建议补 `ACL SETUSER`、`on/off`、`+@read`、`-FLUSHALL`、`~prefix:*`、`&channel`、密码轮换、最小权限、默认用户禁用和 ACL 日志审计。 |
| 7 | `content/questions/redis/redis-cache-penetration.md` | 正文质量较好 | P2 | 缓存穿透、击穿、雪崩三者边界清楚，并分别给出空值/布隆、互斥/逻辑过期、分散过期/降级。建议继续补空值缓存 TTL、布隆误判、热点 key 永不过期、互斥锁双重检查、随机过期、熔断阈值和压测验证。 |
| 8 | `content/questions/redis/redis-client-output-buffer.md` | 方向正确，参数和排查不足 | P1 | 大范围查询、慢客户端、Pub/Sub 消费慢会撑爆输出缓冲区，方向正确，但重复 `## 图解提示`。建议补 `client-output-buffer-limit` 三类客户端配置、`CLIENT LIST` 中 `obl/omem`、大 key 查询、慢网络、订阅者隔离、断开策略和业务端限流。 |
| 9 | `content/questions/redis/redis-cluster-failover.md` | 方向正确，故障转移状态机不足 | P1 | PFAIL、FAIL、从节点竞选、主节点投票和 MOVED 更新方向正确，但重复 `## 图解提示` 且节点截断。建议补 gossip 探测、`cluster-node-timeout`、fail report 多数派、replica offset 优先级、config epoch、脑裂限制、`CLUSTER NODES` 观测和故障演练步骤。 |
| 10 | `content/questions/redis/redis-cluster-hash-slot.md` | 方向正确，slot 细节不足 | P1 | 16384 个槽、CRC16、客户端按槽路由、迁移时重定向，这些正确，但重复 `## 图解提示`。建议补 hash tag `{}`、跨 slot 多 key 限制、reshard、slot map 刷新、MOVED/ASK 与本题的关系、热点 slot 问题和 Cluster 不等于强一致。 |

## 优先修复建议

1. 先修 5 篇重复 `## 图解提示`，Cluster failover/hash slot/MOVED-ASK 适合画状态机或时序图。
2. Redis Cluster 三题统一术语：slot、hash tag、slot cache、MOVED、ASK、ASKING、config epoch、gossip、failover。
3. Redis 运维题必须补命令证据：`INFO memory`、`MEMORY STATS`、`CLIENT LIST`、`ACL LIST`、`CLUSTER NODES`、`SLOWLOG GET`。
4. 缓存题要把“策略名”落到执行闭环：预热源、开关、TTL、互斥、降级阈值、回源保护和监控指标。
5. 图解节点应避免省略 Redis 专有名词，尤其是 CRC16、PFAIL、ASKING、key pattern、client-output-buffer-limit。
