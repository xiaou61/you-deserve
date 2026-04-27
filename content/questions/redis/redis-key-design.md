---
title: "Redis key 设计要注意什么？"
slug: "redis-key-design"
category: "Redis"
tags: ["Redis", "key 设计", "缓存", "规范"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目规范"
order: 2530
summary: "Redis key 要有业务前缀、层级清晰、长度适中、避免大 key 和无过期时间滥用。"
---

## 一句话结论

Redis key 设计要做到命名清晰、层级明确、长度适中、避免冲突，并注意过期时间和大 key 风险。

## 通俗解释

key 像仓库标签。标签写得清楚，找货快；标签乱写，后面排查和清理都会痛苦。

## 面试回答

常见规范：

- 使用业务前缀：`user:profile:1001`。
- 用冒号分层。
- key 不要过长，避免额外内存浪费。
- 避免存巨大 value 或巨大集合。
- 临时缓存要设置 TTL。
- 不同环境和租户要避免 key 冲突。

好的 key 设计能提升可维护性，也方便监控、扫描和清理。

## 常见追问

### key 越短越好吗？

不是。太短可读性差，太长浪费内存，要在可读性和空间之间平衡。

### 为什么不能随便用 KEYS 查 key？

`KEYS` 会阻塞 Redis，生产环境大数据量下风险很高，应使用 SCAN 分批扫描。

## 易错点

- 不要没有业务前缀。
- 不要把所有 key 都设成永不过期。
- 不要忽略大 key 对 Redis 延迟的影响。

## 记忆钩子

**Redis key 是仓库标签，清楚、分层、别太大。**
