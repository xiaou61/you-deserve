---
title: "Kafka 事务消息解决什么问题？"
slug: "kafka-transactions"
category: "消息队列"
tags: ["Kafka", "事务", "消息队列", "一致性"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "MQ 进阶"
order: 3400
summary: "Kafka 事务让一组消息和消费位移提交具备原子性，是 exactly-once 语义的重要基础。"
---

## 一句话结论

Kafka 事务用于保证一组消息写入、以及消费位移提交的原子性，常用于流处理中的 exactly-once 语义。

## 通俗解释

它像银行柜台办理一组业务。要么转账、记账、回执都成功，要么一起撤销，不能只成功一半。

## 面试回答

Kafka 事务常见价值：

- 生产者可以把多条消息作为一个事务提交。
- 消费者处理消息后，可以把输出消息和 offset 提交放进同一事务。
- 下游开启 `read_committed` 时，只读取已提交事务消息。

它主要解决 Kafka 内部读写链路的原子性问题，不等于自动解决数据库和 Kafka 的分布式事务。业务库写入和 Kafka 发送仍要用本地消息表、事务消息或其他一致性方案兜底。

## 常见追问

### Kafka 事务等于业务强一致吗？

不等于。Kafka 事务保证 Kafka 内部消息和 offset 的原子性，不自动保证外部数据库一致。

### read_committed 有什么作用？

消费者只读取已提交事务的消息，避免读到未提交或已中止的事务消息。

## 易错点

- 不要把 Kafka 事务和数据库事务混为一谈。
- 事务会带来额外开销，不是所有场景都需要。
- 外部系统一致性仍要单独设计。

## 记忆钩子

**Kafka 事务管消息原子，不包治业务一致。**

## 图解提示

适合画时序图：begin transaction -> send messages -> send offsets -> commit/abort -> consumer read_committed。
