# 题目质检 Batch 16：MQ + Kafka 151-160

审查时间：2026-05-03  
范围：排序后的第 151-160 道题，`content/questions/mq/consumer-backpressure.md` 至 `content/questions/mq/kafka-idempotent-producer.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批从 JVM 切到 MQ/Kafka。`delayed-message.md`、`kafka-consumer-group.md`、`consumer-backpressure.md` 的主体答案可用，能讲清基本方向。主要问题是 Kafka 高阶语义不够细，后半段仍然有明显生成模板：

- 10 篇都命中 MQ 通用模板，`实战落地`、`追问准备`、`回答模板` 里反复出现同一套 TraceId、重试、死信、灰度回滚话术。
- 3 篇存在重复 `## 图解提示`：`consumer-backpressure.md`、`delayed-retry-wheel.md`、`kafka-controller.md`。
- `kafka-controller.md` 的 `常见追问` 明显占位，且图解节点 `Control...`、`ZooKeeper 选...` 截断。
- Kafka 语义题需要更精细：Exactly once 要区分 Kafka 事务/EOS 与外部业务系统；acks 要补 `min.insync.replicas`；幂等生产者要补 PID、epoch、sequence、in-flight、单分区边界；Consumer Group 要补 group coordinator、心跳和 rebalance 参数。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mq/consumer-backpressure.md` | 主体正确，图解重复 | P2 | 控制拉取、并发、扩消费者、限流/熔断、监控 lag 和耗时都正确，也能说明扩容受分区和下游瓶颈限制。建议补 Kafka `pause/resume`、`max.poll.records`、线程池队列水位、下游限流反馈、背压和入口限流的传递关系。存在重复 `图解提示`。 |
| 2 | `content/questions/mq/consumer-lag.md` | 基础正确，指标口径可细化 | P2 | Lag 的定义、变大原因、扩容限制、Lag 为 0 不代表业务正常都对。建议补 log end offset、committed offset、current position 的区别；Consumer Lag、端到端消息延迟和业务处理耗时不是同一指标；排查要看分区级 lag、rebalance、`max.poll.interval.ms` 和异常消息。 |
| 3 | `content/questions/mq/dead-letter-queue.md` | 方向正确，产品差异可补 | P2 | 死信队列的失败隔离、告警、排查、补偿和重放幂等讲对。建议补不同 MQ 的进入死信条件差异，如 RabbitMQ 的 reject/nack/TTL/队列长度，RocketMQ/Kafka 通常要靠重试 topic、DLQ topic 或业务异常表实现；死信消息需要记录原 topic、key、offset、失败原因和重放次数。 |
| 4 | `content/questions/mq/delayed-message.md` | 正文较好，可保留 | P2 | MQ 原生延迟、TTL+DLQ、时间轮、Redis ZSet、数据库扫表等方案对比完整，也提醒到期后查询当前业务状态。建议补 RocketMQ 延迟级别/定时消息版本差异、RabbitMQ TTL 队头阻塞风险、Redis ZSet 扫描并发和抢占锁、恢复补偿与重复投递。 |
| 5 | `content/questions/mq/delayed-retry-wheel.md` | 核心正确，图解重复 | P2 | 分级退避、区分临时/永久失败、最大次数进死信、幂等都正确。建议补指数退避与抖动 jitter，避免同一时间大量重试形成重试风暴；补重试原因分类、重试预算、按错误码决定是否重试、死信消费告警和人工补偿闭环。存在重复 `图解提示`。 |
| 6 | `content/questions/mq/exactly-once.md` | 方向正确，Kafka EOS 需补 | P2 | 把投递语义和业务处理语义区分开、强调消费端幂等是正确的。建议补 Kafka 在特定范围内通过幂等生产者 + 事务支持 EOS，尤其是 Kafka 内部 consume-process-produce 链路；但外部 DB/HTTP 副作用仍需要业务幂等、事务外盒或状态机。否则容易让读者只得到“MQ 做不到”的粗结论。 |
| 7 | `content/questions/mq/kafka-acks.md` | 基础正确，可靠性组合需细 | P2 | `acks=0/1/all` 的基本语义和可靠性/延迟取舍正确。建议补 `acks=all` 必须结合副本数、ISR 和 `min.insync.replicas` 才有意义；ISR 不足会返回异常；还要配合 `retries`、幂等生产者、`delivery.timeout.ms`、`request.timeout.ms`、unclean leader election 风险。 |
| 8 | `content/questions/mq/kafka-consumer-group.md` | 正文较好，组协调细节可补 | P2 | 同组分摊、组间独立、分区数限制、rebalance 影响都讲得清楚。建议补 Group Coordinator、心跳、`session.timeout.ms`、`max.poll.interval.ms`、分区分配策略、cooperative rebalance、static membership，以及业务处理过慢导致被踢出组的排查。图解节点有截断。 |
| 9 | `content/questions/mq/kafka-controller.md` | 核心正确，追问占位明显 | P1 | Controller 负责 leader 选举、元数据变更、Broker 上下线、KRaft 去 ZooKeeper，方向正确。但 `常见追问` 直接复用正文句子，重复 `图解提示`，且图解节点截断。建议补 ZooKeeper 时代 Controller 与 KRaft Controller Quorum 的区别、active controller、metadata log、Controller failover、元数据传播延迟和控制面监控指标。 |
| 10 | `content/questions/mq/kafka-idempotent-producer.md` | 核心正确，机制边界不足 | P2 | PID 和 sequence 避免生产者重试导致单分区重复写入，这个结论正确，也提醒了不等于业务幂等。建议补 Producer ID、producer epoch、每分区 sequence、broker 去重窗口、`enable.idempotence`、`max.in.flight.requests.per.connection` 对顺序的影响、事务用于跨分区/consume-process-produce 的语义。图解节点有截断。 |

## 优先修复建议

1. 先合并 `consumer-backpressure.md`、`delayed-retry-wheel.md`、`kafka-controller.md` 的重复 `图解提示`，并补全 Kafka Controller 图解节点。
2. Kafka 可靠性题要统一补“配置组合”：acks、ISR、min.insync.replicas、retries、幂等生产者、事务、消费者 offset 提交。
3. `exactly-once.md` 需要明确 Kafka EOS 能保证的范围，以及外部业务副作用为什么仍然要靠幂等/事务外盒。
4. Consumer Group/Lag 两题建议补分区级指标、rebalance、心跳和 `max.poll.interval.ms`，避免只讲“加消费者”。
5. 延迟消息和延迟重试题正文较好，优先补产品差异、恢复补偿、重试风暴和 jitter。
