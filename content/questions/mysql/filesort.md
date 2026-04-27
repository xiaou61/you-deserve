---
title: "MySQL filesort 是什么？"
slug: "mysql-filesort"
category: "MySQL"
tags: ["MySQL", "filesort", "排序", "执行计划"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 2470
summary: "filesort 表示 MySQL 需要额外排序，可能在内存或磁盘完成，不一定真的只是在文件里排序。"
---

## 一句话结论

filesort 表示 MySQL 无法直接利用索引顺序得到结果，需要额外排序，可能在内存中，也可能落盘。

## 通俗解释

如果数据本来就按名单排好了，直接拿就行；如果没排好，就要额外把资料摊开重新排序。

## 面试回答

EXPLAIN 的 Extra 中出现 `Using filesort`，说明 MySQL 需要额外排序。

常见原因：

- order by 字段没有合适索引。
- 排序字段和索引顺序不匹配。
- 联合索引不满足最左前缀或排序规则。
- where、order by、limit 组合不合理。

filesort 不一定很糟，但大数据量排序可能非常慢，尤其是需要磁盘临时文件时。

## 常见追问

### filesort 一定发生在磁盘吗？

不一定。名字叫 filesort，但可能在内存里完成，内存不够才可能落盘。

### 怎么减少 filesort？

给排序字段设计合适索引，控制返回数据量，避免不必要排序。

## 易错点

- filesort 不等于一定用了磁盘文件。
- 小数据量 filesort 不一定是瓶颈。
- 大分页加排序要特别小心。

## 记忆钩子

**filesort 是额外整理排序，不一定真落文件。**
