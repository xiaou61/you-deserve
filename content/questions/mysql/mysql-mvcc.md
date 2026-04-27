---
title: "MySQL MVCC 是什么？"
slug: "mysql-mvcc"
category: "MySQL"
tags: ["MySQL", "MVCC", "事务", "ReadView"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 270
summary: "从版本链、undo log 和 Read View 理解快照读为什么不阻塞写。"
---

## 一句话结论

MVCC 是多版本并发控制，InnoDB 通过版本链、undo log 和 Read View，让读操作可以读到符合当前事务视图的数据版本，从而减少读写阻塞。

## 通俗解释

数据库里一行数据不是只有当前版本，还会通过 undo log 串起历史版本。事务读取时，不一定非要读最新版本，而是根据自己的“可见规则”挑一个能看的版本。

这就像文档有历史记录，每个人打开文档时看到的是自己当时允许看到的版本。

## 面试回答

InnoDB 的 MVCC 主要依赖：

1. 隐藏字段，比如事务 ID 和回滚指针。
2. undo log，用来保存旧版本并形成版本链。
3. Read View，用来判断某个版本对当前事务是否可见。

普通 select 通常是快照读，它通过 Read View 读取可见版本，不需要对数据行加锁，所以读写并发性能更好。

在 Read Committed 下，每次快照读都会生成新的 Read View；在 Repeatable Read 下，事务内通常复用第一次快照读生成的 Read View，所以能做到可重复读。

## 常见追问

### MVCC 能解决所有并发问题吗？

不能。MVCC 主要服务快照读。涉及更新、加锁读、范围修改等场景，还需要锁机制配合。

### 当前读是什么？

当前读读取最新版本，并可能加锁，比如 `select ... for update`、`update`、`delete`。

## 易错点

- 不要把 MVCC 理解成单纯“不加锁”。
- 不要把快照读和当前读混在一起。
- 不要忘记隔离级别会影响 Read View 生成时机。

## 记忆钩子

**MVCC 像历史版本管理：不是所有人都读最新版，而是读自己该看到的版本。**
