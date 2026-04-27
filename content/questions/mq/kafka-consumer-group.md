---
title: "Kafka Consumer Group 是什么？"
slug: "kafka-consumer-group"
category: "消息队列"
tags: ["Kafka", "Consumer Group", "消息队列", "分区"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 1200
summary: "理解同组消费者共同消费 Topic 分区，不同组之间互不影响。"
---

## 一句话结论

Consumer Group 是 Kafka 的消费组机制。同一组内消费者共同消费一个 Topic 的分区；不同消费组之间互不影响，可以各自消费完整消息流。

## 通俗解释

一个 Topic 像一套试卷。一个消费组像一个班级，班里同学分工批不同题。另一个班级也可以完整拿到同一套试卷自己批。

## 面试回答

Kafka Topic 被分成多个 Partition。同一个 Consumer Group 内，一个 Partition 同一时刻通常只能分配给组内一个消费者消费。这样可以并行消费，又避免同组内重复消费。

不同 Consumer Group 之间互相独立，都可以消费同一个 Topic 的消息。

如果消费者数量超过分区数，多出来的消费者会空闲。

## 常见追问

### Rebalance 是什么？

当消费者加入、退出或分区变化时，Kafka 会重新分配分区给消费者，这个过程叫 Rebalance。它可能导致短暂停顿。

### 如何提高消费并行度？

增加分区数和消费者数，但消费者数超过分区数后不会继续提升同组消费并行度。

## 易错点

- 不要说一个分区能被同组多个消费者同时消费。
- 不要忽略消费者数超过分区数会空闲。
- 不同消费组会各自消费消息，不是抢同一份。

## 记忆钩子

**同组分工，不同组各看一份。**
