---
title: "Redis Pub/Sub 和 Stream 有什么区别？"
slug: "redis-pubsub-vs-stream"
category: "Redis"
tags: ["Redis", "Pub/Sub", "Stream", "消息"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 2040
summary: "Pub/Sub 是实时广播，Stream 是可持久化的消息流，支持消费者组和确认机制。"
---

## 一句话结论

Redis Pub/Sub 更像实时广播，消息不会为离线消费者保留；Redis Stream 更像消息日志，支持持久化、消费者组和确认机制。

## 通俗解释

Pub/Sub 像现场广播，人在现场才能听到；Stream 像公告记录本，没赶上也可以回来按编号查看。

## 面试回答

主要区别：

- Pub/Sub：发布即推送，订阅者在线才能收到，适合实时通知。
- Stream：消息追加到流里，有 ID，可回溯，支持消费者组和 ACK。
- Pub/Sub 不适合可靠消费。
- Stream 更适合轻量消息队列场景。

如果业务要求消息不丢、可重试、可追踪，Stream 比 Pub/Sub 更合适。

## 常见追问

### Pub/Sub 适合什么场景？

适合在线通知、简单广播、实时状态变更推送等不强依赖可靠投递的场景。

### Stream 还需要处理积压吗？

需要。Stream 消息保留会占用内存，要设置长度限制或清理策略。

## 易错点

- Pub/Sub 不保证离线消息。
- Stream 更可靠但也更复杂。
- Redis 做消息队列要注意内存和持久化风险。

## 记忆钩子

**Pub/Sub 是广播，Stream 是账本。**
