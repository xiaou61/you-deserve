---
title: "SQL 逻辑执行顺序是什么？"
slug: "sql-execution-order"
category: "MySQL"
tags: ["MySQL", "SQL", "执行顺序", "查询"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1990
summary: "SQL 逻辑顺序通常是 from、where、group by、having、select、order by、limit。"
---

## 一句话结论

SQL 的逻辑执行顺序通常是 `from`、`where`、`group by`、`having`、`select`、`order by`、`limit`。

## 通俗解释

查数据像办活动名单。先确定从哪个班找人，再按条件筛人，再分组统计，再筛分组结果，最后决定展示哪些字段和排序分页。

## 面试回答

常见逻辑顺序：

1. `from`：确定数据来源。
2. `where`：过滤原始行。
3. `group by`：分组。
4. `having`：过滤分组后的结果。
5. `select`：选择输出字段。
6. `order by`：排序。
7. `limit`：限制返回数量。

这解释了为什么 where 不能直接使用聚合函数筛选分组结果，而 having 可以。

## 常见追问

### where 和 having 有什么区别？

where 过滤分组前的行，having 过滤分组后的聚合结果。

### select 里的别名能不能在 where 里用？

通常不能，因为逻辑上 where 早于 select 执行。

## 易错点

- 不要把 SQL 书写顺序当成逻辑执行顺序。
- where 不能筛选聚合后的结果。
- 实际物理执行顺序会由优化器调整，逻辑顺序用于理解语义。

## 记忆钩子

**先找表，再筛行，后分组，最后展示排序分页。**
