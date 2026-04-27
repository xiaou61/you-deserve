---
title: "EXPLAIN ANALYZE 和 EXPLAIN 有什么区别？"
slug: "mysql-explain-analyze"
category: "MySQL"
tags: ["MySQL", "EXPLAIN", "EXPLAIN ANALYZE", "执行计划"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "线上排查"
order: 2450
summary: "EXPLAIN 看优化器预估执行计划，EXPLAIN ANALYZE 会实际执行并给出真实耗时和行数。"
---

## 一句话结论

EXPLAIN 主要看预估执行计划，EXPLAIN ANALYZE 会实际执行 SQL，并展示真实耗时、行数等执行信息。

## 通俗解释

EXPLAIN 像导航预计路线，EXPLAIN ANALYZE 像真的开一遍并记录每段耗时。

## 面试回答

EXPLAIN 可以帮助我们看：

- 是否走索引。
- 访问类型。
- 预估扫描行数。
- 是否使用临时表或排序。

EXPLAIN ANALYZE 会实际执行 SQL，给出实际执行耗时和真实行数，更适合分析优化器估算是否准确。

但线上使用要谨慎，因为它会真正执行查询，复杂 SQL 可能带来压力。

## 常见追问

### EXPLAIN 的 rows 准确吗？

rows 是估算值，不一定准确。EXPLAIN ANALYZE 可以看到实际行数。

### 线上能随便跑 EXPLAIN ANALYZE 吗？

不建议随便跑，尤其是重查询，因为它会实际执行。

## 易错点

- EXPLAIN 不等于真实执行耗时。
- EXPLAIN ANALYZE 会真实执行 SQL。
- 分析慢 SQL 要结合实际耗时、锁等待和系统负载。

## 记忆钩子

**EXPLAIN 是路线预估，ANALYZE 是实际跑一趟。**
