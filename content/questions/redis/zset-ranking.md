---
title: "Redis ZSet 怎么实现排行榜？"
slug: "redis-zset-ranking"
category: "Redis"
tags: ["Redis", "ZSet", "排行榜", "Sorted Set"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 2060
summary: "ZSet 用 member 表示对象、score 表示分数，可以快速按分数排序和查询排名。"
---

## 一句话结论

Redis ZSet 可以用 member 存用户或商品 ID，用 score 存分数，通过有序集合快速实现排行榜、Top N 和排名查询。

## 通俗解释

ZSet 像一张自动排序的成绩单。每个人有名字和分数，分数一变，排名自动调整。

## 面试回答

排行榜常见操作：

- `ZADD` 添加或更新分数。
- `ZREVRANGE` 查询分数从高到低的 Top N。
- `ZRANK` 或 `ZREVRANK` 查询排名。
- `ZINCRBY` 增加分数。

适合积分榜、热度榜、销量榜等场景。

如果排行榜数据非常大，要考虑分榜、定期落库、冷热数据拆分和分页查询成本。

## 常见追问

### 分数相同怎么办？

Redis 会按 member 字典序辅助排序。如果业务有更复杂规则，需要把时间等因素编码进 score 或额外处理。

### 排行榜数据要不要落数据库？

通常重要数据要落数据库，Redis 负责高性能查询和实时排名。

## 易错点

- ZSet 适合按单一 score 排序。
- score 是浮点数，复杂排序规则要谨慎设计。
- Redis 数据不能替代所有持久化方案。

## 记忆钩子

**ZSet 是自动排序成绩单：member 是人，score 是分。**
