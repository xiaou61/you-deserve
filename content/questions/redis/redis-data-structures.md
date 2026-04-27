---
title: "Redis 常见数据结构分别适合什么场景？"
slug: "redis-data-structures"
category: "Redis"
tags: ["Redis", "数据结构", "缓存", "场景题"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 310
summary: "把 String、Hash、List、Set、ZSet 和业务场景对应起来。"
---

## 一句话结论

Redis 数据结构要按场景选：String 适合简单缓存和计数，Hash 适合对象字段，List 适合队列，Set 适合去重，ZSet 适合排行榜。

## 通俗解释

Redis 不是只有 key-value，它更像一个工具箱。不同工具解决不同问题：锤子敲钉子，扳手拧螺丝。你要先说业务场景，再说用哪个结构。

## 面试回答

常见结构和场景：

- String：缓存 JSON、验证码、计数器、分布式锁 value。
- Hash：用户信息、商品信息这类对象字段缓存。
- List：简单队列、消息列表，但复杂消息系统不建议只靠它。
- Set：去重、共同好友、标签集合。
- ZSet：排行榜、按分数排序的延迟任务候选。
- Bitmap：签到、在线状态。
- HyperLogLog：UV 粗略统计。

面试里最好别只背命令，而是把结构和业务场景对应起来。

## 常见追问

### 用户对象用 String 还是 Hash？

都可以。String 存整个 JSON 简单，Hash 可以按字段更新。选择要看对象大小、更新粒度和访问方式。

### 排行榜为什么用 ZSet？

ZSet 每个元素有分数，天然支持按分数排序、取 TopN、查排名。

## 易错点

- 不要用 Redis List 替代专业 MQ 处理复杂可靠消息。
- 不要把大对象一股脑塞 Redis，要注意大 key。
- 不要只背命令，要能说业务场景。

## 记忆钩子

**String 缓存，Hash 对象，Set 去重，ZSet 排名。**
