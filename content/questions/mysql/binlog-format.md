---
title: "binlog 有哪些格式？"
slug: "mysql-binlog-format"
category: "MySQL"
tags: ["MySQL", "binlog", "主从复制", "日志"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 1980
summary: "binlog 常见格式有 statement、row、mixed，row 更准确但日志量更大。"
---

## 一句话结论

MySQL binlog 常见格式有 statement、row、mixed，其中 row 记录行级变化，更准确但日志量更大。

## 通俗解释

statement 像记录“执行了哪条命令”，row 像记录“每一行具体怎么变”，mixed 像根据情况选择记录方式。

## 面试回答

binlog 格式主要有：

- statement：记录 SQL 语句。
- row：记录每行数据的变更。
- mixed：MySQL 根据情况在 statement 和 row 之间选择。

statement 日志量小，但遇到不确定函数、触发器等场景可能导致主从结果不一致。

row 更可靠，能准确记录行变化，常用于主从复制和数据同步，但日志量更大。

## 常见追问

### 为什么现在更常用 row？

因为 row 记录实际行变更，复制和数据恢复更可靠，不容易因为 SQL 非确定性导致主从不一致。

### binlog 和 redo log 区别是什么？

binlog 是 MySQL Server 层归档日志，用于复制和恢复；redo log 是 InnoDB 层日志，用于崩溃恢复。

## 易错点

- 不要把 binlog 和 redo log 混为一谈。
- statement 不一定在所有场景都安全。
- row 格式更可靠，但会增加日志体积。

## 记忆钩子

**statement 记命令，row 记变化，mixed 看情况。**
