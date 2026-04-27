---
title: "MySQL count(*)、count(1)、count(字段) 有什么区别？"
slug: "mysql-count-difference"
category: "MySQL"
tags: ["MySQL", "count", "SQL", "聚合"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 2010
summary: "count(*) 和 count(1) 都统计行数，count(字段) 只统计该字段非 NULL 的行。"
---

## 一句话结论

`count(*)` 和 `count(1)` 通常都统计结果集行数，`count(字段)` 只统计该字段不为 NULL 的行。

## 通俗解释

`count(*)` 像数有多少个人，`count(字段)` 像数有多少人填写了手机号，没填的人不算。

## 面试回答

区别：

- `count(*)`：统计行数，不关心具体字段。
- `count(1)`：统计常量 1，本质也是统计行数。
- `count(字段)`：只统计字段值不为 NULL 的行。

现代 MySQL 优化器通常会对 `count(*)` 做优化，所以不要迷信 `count(1)` 一定更快。

如果大表频繁精确 count，可能会很慢，需要考虑缓存计数、汇总表或业务上避免实时精确总数。

## 常见追问

### count(*) 会不会把所有字段都取出来？

不会。它是统计行数，不是读取所有字段内容。

### 大表分页为什么不建议每次 count？

大表实时 count 成本高，频繁统计会拖慢接口。

## 易错点

- `count(字段)` 会忽略 NULL。
- 不要绝对说 `count(1)` 比 `count(*)` 快。
- 大表 count 要结合业务可接受的精确度。

## 记忆钩子

**count(*) 数人头，count(字段) 数填了字段的人。**
