---
title: "redo log、undo log、binlog 分别有什么用？"
slug: "mysql-redo-undo-binlog"
category: "MySQL"
tags: ["MySQL", "redo log", "undo log", "binlog", "事务"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 290
summary: "把崩溃恢复、事务回滚、主从复制和归档恢复分清楚。"
---

## 一句话结论

redo log 保证崩溃恢复，undo log 支持回滚和 MVCC，binlog 用于主从复制和数据恢复。三者解决的问题不同。

## 通俗解释

可以把数据库修改想成记账：

- redo log 是“我已经把这笔账记到草稿里，断电后也能补上”。
- undo log 是“如果这笔操作要撤销，按这个反向记录恢复”。
- binlog 是“把所有变更按顺序记成外部流水，方便同步给别人或以后重放”。

## 面试回答

redo log 是 InnoDB 存储引擎层日志，记录物理页修改，主要用于崩溃恢复，保证事务持久性。

undo log 记录修改前的数据版本，用于事务回滚，也用于 MVCC 构建历史版本链。

binlog 是 MySQL Server 层日志，记录逻辑变更，常用于主从复制、数据恢复和审计。

事务提交时还涉及两阶段提交，用来保证 redo log 和 binlog 的一致性，避免一个成功一个失败导致主库和从库数据不一致。

## 常见追问

### redo log 和 binlog 有什么区别？

redo log 是 InnoDB 的物理日志，循环写，服务崩溃恢复。binlog 是 Server 层逻辑日志，追加写，服务复制和归档恢复。

### undo log 是不是也用于崩溃恢复？

undo log 更主要用于回滚和 MVCC。崩溃恢复时也可能参与未提交事务的回滚，但不要把它和 redo log 的职责混掉。

## 易错点

- 不要把 redo log 和 binlog 都说成“恢复日志”就结束。
- 不要忘记 binlog 是 Server 层，redo/undo 是 InnoDB 层。
- 不要忽略两阶段提交。

## 记忆钩子

**redo 保证做过能补，undo 保证做错能撤，binlog 保证变更能传。**
