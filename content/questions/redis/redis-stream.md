---
title: "Redis Stream 是什么？"
slug: "redis-stream"
category: "Redis"
tags: ["Redis", "Stream", "消息队列", "消费者组"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面/项目追问"
order: 2030
summary: "Redis Stream 是 Redis 的日志型消息结构，支持消息追加、消费者组和待确认消息。"
---

## 一句话结论

Redis Stream 是 Redis 提供的日志型消息数据结构，支持消息追加、消息 ID、消费者组和待确认消息列表。

## 通俗解释

Stream 像一本持续追加的流水账。每条记录都有编号，消费者可以按编号读，也可以分组协作处理。

## 面试回答

Redis Stream 常见能力：

- `XADD` 追加消息。
- `XREAD` 读取消息。
- 消费者组支持多个消费者协作消费。
- PEL 待确认列表记录已经投递但还没确认的消息。
- `XACK` 确认消息处理完成。

它比 Redis Pub/Sub 更适合需要消息保留、确认和消费者组的场景。但如果需要更强的堆积能力、跨服务可靠投递和复杂消息治理，Kafka、RocketMQ 等专业 MQ 仍然更合适。

## 常见追问

### Stream 和 Pub/Sub 有什么区别？

Pub/Sub 更像实时广播，订阅者不在线可能收不到；Stream 会保留消息，支持按 ID 消费和确认。

### Redis Stream 能替代 Kafka 吗？

小规模轻量场景可以，但大规模日志流、持久化吞吐和生态能力上 Kafka 更专业。

## 易错点

- 不要把 Stream 和 Pub/Sub 混为一谈。
- 消息确认和待确认列表要处理，否则可能积压。
- Redis 内存容量仍然是重要限制。

## 记忆钩子

**Stream 是 Redis 流水账，能追号、能分组、能确认。**
