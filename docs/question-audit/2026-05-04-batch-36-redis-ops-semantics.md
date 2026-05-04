# 题目质检 Batch 36：Redis 运维与语义机制 351-360

审查时间：2026-05-04  
范围：按文件路径排序后的第 351-360 道题，`content/questions/redis/redis-rate-limit-lua.md` 至 `content/questions/redis/redlock.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 Redis + Lua 限流、SCAN/KEYS、主从/哨兵/Cluster、单线程性能、SlowLog、Stream 消费组、Stream、事务、UNLINK/DEL、RedLock。`redis-single-thread-fast.md` 的主体较好；Stream 和事务题方向正确但需要补命令语义；SCAN、限流、SlowLog、UNLINK、RedLock 这些题如果不补参数和边界，很容易在面试追问里显得空。

- 9 篇命中通用详解模板，只有 `redis-single-thread-fast.md` 没有命中模板句。
- 4 篇存在重复 `## 图解提示`：`redis-rate-limit-lua.md`、`redis-scan-vs-keys.md`、`redis-stream-consumer-group.md`、`redis-unlink-vs-del.md`。
- 图解节点大量使用“验证闭环/面试收束”，说明 visual 还没有完全 Redis 化。
- RedLock、事务、Stream 消费组属于高频追问题，需要优先补争议点、失败语义和补偿机制。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/redis/redis-rate-limit-lua.md` | 方向正确，算法和热点风险不足 | P1 | 固定窗口、滑动窗口、Lua 原子检查方向正确，但重复 `## 图解提示`。建议补令牌桶/漏桶对比、ZSET 滑窗清理、TTL 设置、脚本耗时、热点 key 分片、限流返回码、网关限流和 Redis 故障降级策略。 |
| 2 | `content/questions/redis/redis-scan-vs-keys.md` | 方向正确，SCAN 语义不足 | P1 | KEYS 阻塞、SCAN 分批返回、可能重复、删除大量 key 用 SCAN，这些正确，但重复 `## 图解提示`。建议补 cursor 语义、COUNT 不是精确条数、MATCH/TYPE、非快照一致、重复去重、Cluster 每节点扫描和生产删除节流。 |
| 3 | `content/questions/redis/redis-sentinel-cluster.md` | 方向正确，拓扑对比不足 | P1 | 主从解决读扩展和备份、哨兵做故障转移、Cluster 做分片，这是正确主线。建议补哨兵主观/客观下线、选主、通知客户端、Cluster 16384 slot、MOVED/ASK、多 key 限制、容量扩展和一致性边界。 |
| 4 | `content/questions/redis/redis-single-thread-fast.md` | 正文质量较好 | P2 | 内存操作、高效结构、IO 多路复用和局部瓶颈讲得较好。建议补 Redis 6 I/O threading 只处理网络读写、命令执行仍主要单线程，补慢命令、大 key、fork、AOF fsync 和 Lua 长脚本这些“单线程变慢”的来源。 |
| 5 | `content/questions/redis/redis-slowlog.md` | 方向正确，命令和配置不足 | P1 | 慢命令排查方向正确，但正文模板化。建议补 `slowlog-log-slower-than`、`slowlog-max-len`、`SLOWLOG GET/LEN/RESET`、慢日志不含网络耗时、结合 `LATENCY DOCTOR`、`MONITOR` 风险和业务调用链定位。 |
| 6 | `content/questions/redis/redis-stream-consumer-group.md` | 方向正确，消费组失败语义不足 | P1 | XADD、PEL、XPENDING、幂等方向正确，但重复 `## 图解提示`。建议补 `XGROUP CREATE`、`XREADGROUP`、`XACK`、`XPENDING`、`XAUTOCLAIM`、消费者宕机转移、死信、重复投递和消息保留策略。 |
| 7 | `content/questions/redis/redis-stream.md` | 方向正确，和 MQ 对比不足 | P2 | XADD、XREAD、消费组、PEL、XACK 这些核心点正确。建议补 ID 生成、`MAXLEN`、阻塞读取、消费者组与普通读取区别、Stream 不是完整 Kafka 替代、持久化依赖 Redis 内存和 AOF/RDB。 |
| 8 | `content/questions/redis/redis-transaction.md` | 方向正确，事务语义易误解 | P1 | MULTI/EXEC/DISCARD/WATCH 方向正确。建议明确 Redis 事务不是数据库事务，不支持自动回滚；命令入队错误与执行期错误区别；WATCH 是乐观锁；事务期间不隔离读写；Lua 往往更适合条件原子逻辑。 |
| 9 | `content/questions/redis/redis-unlink-vs-del.md` | 方向正确，lazy free 细节不足 | P1 | DEL 同步释放、UNLINK 异步释放大对象方向正确，但重复 `## 图解提示`。建议补 lazyfree 后台线程、内存不是立即下降、`lazyfree-lazy-user-del`、大 key 删除节流、主从复制影响、删除期间监控延迟和 RSS。 |
| 10 | `content/questions/redis/redlock.md` | 方向正确，争议和替代方案不足 | P1 | 多 Redis 实例多数派加锁、时钟和网络分区风险方向正确，但正文模板化。建议补 RedLock 步骤、锁有效期计算、Martin Kleppmann 争议、fencing token、业务资源侧校验、主从锁与单实例锁差异，以及强一致场景建议 etcd/ZooKeeper。 |

## 优先修复建议

1. 先修 4 篇重复 `## 图解提示`，限流、SCAN、Stream 消费组、UNLINK 都适合画命令流程图。
2. Stream 相关题统一补 `XADD/XGROUP/XREADGROUP/XACK/XPENDING/XAUTOCLAIM`，并明确重复投递和幂等。
3. 运维题统一补命令证据：`SLOWLOG GET`、`LATENCY DOCTOR`、`SCAN`、`INFO commandstats`、`MEMORY USAGE`。
4. RedLock 和分布式锁题应统一补 fencing token 与强一致替代方案。
5. 事务题必须明确“不自动回滚、不等同数据库事务”，避免给读者错误安全感。
