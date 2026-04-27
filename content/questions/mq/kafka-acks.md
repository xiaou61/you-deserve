---
title: "Kafka Producer acks 参数怎么理解？"
slug: "kafka-acks"
category: "消息队列"
tags: ["Kafka", "acks", "生产者", "可靠性"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 2570
summary: "acks 控制生产者等待多少副本确认，acks=all 可靠性更高但延迟也可能更高。"
---

## 一句话结论

Kafka Producer 的 acks 参数控制消息写入后需要等待多少确认，acks 越严格可靠性越高，但延迟可能越高。

## 通俗解释

发通知时，acks=0 像发完不管；acks=1 像班长确认收到；acks=all 像班长和关键组员都确认收到。

## 面试回答

常见取值：

- `acks=0`：生产者不等确认，吞吐高但可能丢消息。
- `acks=1`：leader 写入成功就确认。
- `acks=all`：leader 等 ISR 中副本确认后再返回，可靠性更高。

关键业务通常会选择更高可靠性配置，并配合重试、幂等生产者、合理的副本数和 min.insync.replicas。

## 常见追问

### acks=all 就绝对不丢吗？

不是。还要看 ISR、副本数、刷盘策略、重试和异常处理。

### acks 越大越好吗？

不一定。可靠性提升的同时可能增加延迟，要看业务对吞吐和可靠性的要求。

## 易错点

- 不要只配 acks，忽略副本和 ISR。
- acks=0 风险很高。
- 可靠消息是生产者、Broker、消费者共同保证的。

## 记忆钩子

**acks 是回执级别：不等、等 leader、等多数关键副本。**
