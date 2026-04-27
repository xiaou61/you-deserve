---
title: "Kafka ISR 是什么？"
slug: "kafka-isr"
category: "消息队列"
tags: ["Kafka", "ISR", "副本", "高可用"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 2580
summary: "ISR 是与 leader 保持同步的副本集合，Kafka 通过 ISR 控制可靠写入和故障切换。"
---

## 一句话结论

ISR 是 In-Sync Replicas，表示和 leader 保持同步的副本集合，Kafka 会优先从 ISR 中选择新 leader。

## 通俗解释

leader 像主笔记本，ISR 是跟得上进度的备份笔记本。主笔记本坏了，就从跟得上的备份里选一个接班。

## 面试回答

Kafka 分区有 leader 和 follower 副本。生产者和消费者通常与 leader 交互，follower 从 leader 拉取数据。

ISR 中的副本表示同步进度足够接近 leader。落后太多的副本会被踢出 ISR。

`acks=all` 时，通常要等待 ISR 中足够副本确认，配合 `min.insync.replicas` 控制可靠性。

## 常见追问

### follower 落后会怎样？

落后超过阈值可能被移出 ISR，等追上后再加入。

### ISR 越多越好吗？

副本多可靠性更好，但复制成本更高。要在可靠性、性能和成本之间平衡。

## 易错点

- ISR 不是所有副本集合，而是同步副本集合。
- 选主通常优先从 ISR 中选。
- acks 和 ISR 要一起理解。

## 记忆钩子

**ISR 是跟得上进度的备份队伍。**
