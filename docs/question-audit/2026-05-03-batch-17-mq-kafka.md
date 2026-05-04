# 题目质检 Batch 17：MQ + Kafka 161-170

审查时间：2026-05-03  
范围：排序后的第 161-170 道题，`content/questions/mq/kafka-isr.md` 至 `content/questions/mq/mq-idempotent-consume.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批继续是 Kafka/MQ 机制题。`kafka-offset.md`、`message-backlog.md`、`mq-idempotent-consume.md` 的正文质量相对更好，能讲清排障和业务幂等。Kafka 底层机制题普遍方向正确，但还缺少关键参数、日志字段和产品机制边界：

- 10 篇仍有 MQ 通用模板污染，尤其后半段固定出现 TraceId、消费延迟、死信、灰度回滚等套话。
- 4 篇存在重复 `## 图解提示`：`kafka-log-compaction.md`、`kafka-page-cache.md`、`kafka-partition-selection.md`、`kafka-transactions.md`。
- 多个图解节点截断：`Page Cac...`、`read_committe...`、`partiti...`、`tombstone...`，影响关键术语展示。
- Kafka 机制题需要补产品细节：ISR 的 LEO/HW 与 `min.insync.replicas`，Log Compaction 的 tombstone 和清理延迟，Page Cache 的堆外 OS 缓存定位，事务的 `transactional.id`、fencing、transaction coordinator。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mq/kafka-isr.md` | 基础正确，副本机制可补 | P2 | ISR 是同步副本集合、优先从 ISR 选 leader、acks 要结合 ISR 理解，这些正确。建议补 LEO、HW、leader epoch、follower fetch、`replica.lag.time.max.ms`、ISR shrink/expand、`min.insync.replicas` 与 `acks=all` 的写入失败行为、unclean leader election 风险。图解节点有截断。 |
| 2 | `content/questions/mq/kafka-log-compaction.md` | 核心正确，图解重复 | P1 | 按 key 保留较新值、适合状态变更日志、tombstone 表达删除、不是实时去重都正确。但重复 `图解提示`，且追问占位。建议补 compaction 不保证消费者只能看到最新值、后台清理延迟、`cleanup.policy=compact`、`min.cleanable.dirty.ratio`、`delete.retention.ms`、key 为空无法压缩、状态恢复场景。 |
| 3 | `content/questions/mq/kafka-offset.md` | 正文较好，可保留 | P2 | offset 是“消费组 + topic + partition”维度的位置，自动/手动提交的丢与重风险讲得清楚。建议补 `commitSync/commitAsync` 差异、批量提交、`auto.offset.reset`、rebalance 时提交回调、外部存储 offset、事务里提交 offset 的场景。图解节点有截断。 |
| 4 | `content/questions/mq/kafka-page-cache.md` | 方向正确，追问占位明显 | P1 | 顺序 IO、Page Cache、sendfile、堆不要盲目调大都正确。但重复 `图解提示`，`Page Cac...` 和零拷贝节点截断，常见追问仍是占位。建议补 Kafka 为何不把消息放大堆、Page Cache 与 OS 内存的关系、磁盘刷盘/副本复制仍是可靠性关键、零拷贝路径、观察磁盘 IO 和 page cache 命中。 |
| 5 | `content/questions/mq/kafka-partition-selection.md` | 主体正确，默认分区器细节可补 | P1 | 指定 partition、key 哈希、无 key 默认分配、同 key 局部顺序和热点分区都正确。但重复 `图解提示`，图解节点 `partiti...` 截断。建议补 sticky partitioner/默认分区器版本差异、分区数变化导致 key 映射变化、不可用分区选择、key 设计如何兼顾顺序和热点、扩分区后顺序风险。 |
| 6 | `content/questions/mq/kafka-rebalance.md` | 基础正确，协调机制可补 | P2 | rebalance 触发原因、暂停、重复消费、分区数限制、幂等都正确。建议补 Group Coordinator、generation、心跳线程、`session.timeout.ms`、`heartbeat.interval.ms`、`max.poll.interval.ms`、eager vs cooperative rebalance、static membership，以及如何从日志识别频繁 rebalance。 |
| 7 | `content/questions/mq/kafka-storage.md` | 基础正确，文件结构偏浅 | P2 | topic/partition/segment、offset、顺序追加、索引、保留策略都讲对。建议补 `.log`、`.index`、`.timeindex`、base offset、稀疏索引、segment roll、retention by time/size、log compaction 与 delete 策略区别、broker 磁盘满时的风险。图解节点有截断。 |
| 8 | `content/questions/mq/kafka-transactions.md` | 方向正确，事务机制不足 | P1 | 一组消息、offset 提交原子性、`read_committed` 和外部 DB 不自动一致都正确。但重复 `图解提示`，`read_committe...` 截断。建议补 `transactional.id`、Producer fencing、Transaction Coordinator、transaction log、`sendOffsetsToTransaction`、`isolation.level=read_committed`、abort 后消费者可见性、事务超时和性能成本。 |
| 9 | `content/questions/mq/message-backlog.md` | 正文质量较好 | P2 | 按生产端、消费端、并行度、异常消息、下游瓶颈来排查，止血/扩容/补偿/复盘链路清楚。建议补分区级 lag、消费组维度、单分区热点、限流生产端的具体策略、追平时间估算、回放积压时避免打爆下游。后半段模板仍可清理。 |
| 10 | `content/questions/mq/mq-idempotent-consume.md` | 正文扎实，可作为优质稿 | P2 | 重复来源、业务唯一键、去重表、状态机、乐观锁、Redis `setnx` 边界、事务顺序和副作用幂等都讲得好。建议补幂等记录与业务更新同事务、唯一索引冲突处理、Redis 只做前置过滤不能做强兜底、幂等命中率监控、消息 ID 与业务 ID 的选择。 |

## 优先修复建议

1. 先修 `kafka-log-compaction.md`、`kafka-page-cache.md`、`kafka-partition-selection.md`、`kafka-transactions.md` 的重复图解和截断节点。
2. Kafka 机制题统一补“可观察证据”：broker 日志、consumer group 状态、lag/ISR shrink、rebalance 日志、事务 abort/commit 指标。
3. `kafka-transactions.md` 和 `exactly-once.md` 要交叉统一，明确 Kafka 内部 EOS 范围与外部业务一致性的边界。
4. `kafka-offset.md`、`message-backlog.md`、`mq-idempotent-consume.md` 正文质量较高，建议先清理模板段，再补命令和监控指标。
5. `kafka-page-cache.md` 要补 Page Cache 与 JVM heap 的区别，否则读者容易只记住“Kafka 靠缓存”而不知道为什么堆不能配太大。
