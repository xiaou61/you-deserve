---
title: "MySQL 事务隔离级别分别解决什么问题？"
slug: "mysql-transaction-isolation"
category: "MySQL"
tags: ["MySQL", "事务", "MVCC", "隔离级别"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 50
summary: "把脏读、不可重复读、幻读和四种隔离级别串起来。"
---

## 一句话结论

事务隔离级别用来控制多个事务并发执行时互相影响的程度。隔离越强，并发问题越少，但性能和并发能力通常越受影响。

## 通俗解释

可以把数据库想成一个共享账本。很多人同时改账本时，会出现几类问题：

- 看到别人还没提交的草稿，叫脏读。
- 同一事务里两次读同一行，结果变了，叫不可重复读。
- 同一事务里两次按条件查，突然多出或少了几行，叫幻读。

隔离级别就是规定你能看到这个账本的哪个版本。

## 面试回答

SQL 标准定义了四种隔离级别：

| 隔离级别 | 能解决的问题 |
| --- | --- |
| Read Uncommitted | 基本不解决，可能脏读 |
| Read Committed | 解决脏读 |
| Repeatable Read | 解决脏读、不可重复读 |
| Serializable | 最高隔离，基本串行执行 |

MySQL InnoDB 默认是 Repeatable Read，并通过 MVCC 解决一致性读问题。在普通快照读下，同一个事务会读到同一个 Read View，所以可以做到可重复读。

对于幻读，InnoDB 在当前读场景下会通过 next-key lock 等机制处理。

## 常见追问

### RC 和 RR 最大区别是什么？

Read Committed 每次查询都会生成新的 Read View，所以同一事务里两次查询可能看到别的事务已经提交的新结果。Repeatable Read 通常在事务第一次快照读时生成 Read View，后续复用，所以同一事务内读到的快照更稳定。

### MVCC 是锁吗？

MVCC 不是传统意义上的锁。它通过版本链和 Read View 让读操作尽量不阻塞写操作，提高并发性能。

## 易错点

- 不要只背四个英文名，要能说出分别解决什么问题。
- MySQL 的 Repeatable Read 和标准 SQL 的表现不完全等价，要结合 InnoDB 的 MVCC 和锁机制理解。
- 快照读和当前读要分开说。

## 记忆钩子

**隔离级别就是“你能不能看到别人改账本”的规则。**
