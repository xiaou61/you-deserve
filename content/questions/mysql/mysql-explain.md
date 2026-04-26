---
title: "MySQL EXPLAIN 主要看哪些字段？"
slug: "mysql-explain"
category: "MySQL"
tags: ["MySQL", "Explain", "SQL优化", "索引"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 130
summary: "抓住 type、key、rows、Extra 四个重点字段，快速判断 SQL 是否健康。"
---

## 一句话结论

看 EXPLAIN 不要平均用力，重点先看 `type`、`key`、`rows`、`Extra`，判断有没有走索引、扫描量大不大、有没有额外排序或临时表。

## 通俗解释

EXPLAIN 像医生给 SQL 拍片子。你不用一开始就读懂每个指标，但要先看几个关键项：用了什么路走、有没有用导航、预计要走多少路、路上有没有绕远。

## 面试回答

常看的字段有：

- `type`：访问类型，反映查询效率。一般从好到差可粗略理解为 `const`、`eq_ref`、`ref`、`range`、`index`、`ALL`。
- `key`：实际使用的索引。如果是 `NULL`，说明没有使用索引。
- `rows`：优化器预估扫描的行数，越大越需要关注。
- `Extra`：额外信息，比如 `Using index`、`Using where`、`Using temporary`、`Using filesort`。

如果看到 `type=ALL`、`key=NULL`、`rows` 很大，通常说明 SQL 风险较高。看到 `Using temporary` 或 `Using filesort`，要关注是否有排序、分组没有利用好索引。

## 常见追问

### type=index 和 type=ALL 哪个更好？

`index` 是全索引扫描，扫描索引树；`ALL` 是全表扫描。通常 `index` 比 `ALL` 好一些，但如果扫描量很大，也不一定能接受。

### Using filesort 一定很差吗？

不一定，但它表示排序没有完全利用索引，需要额外排序。数据量小时影响不明显，数据量大时可能成为瓶颈。

## 易错点

- 不要只看 key，有时走了索引但扫描行数仍然很大。
- 不要看到 Using where 就以为有问题，它很常见。
- 不要脱离数据量和业务场景判断 SQL 好坏。

## 记忆钩子

**EXPLAIN 四连看：type 看路，key 看索引，rows 看规模，Extra 看额外代价。**
