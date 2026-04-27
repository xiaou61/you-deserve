---
title: "Redis 事务是什么？"
slug: "redis-transaction"
category: "Redis"
tags: ["Redis", "事务", "MULTI", "EXEC"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 2020
summary: "Redis 事务通过 MULTI、EXEC 把多条命令按顺序执行，但不支持传统数据库那种回滚。"
---

## 一句话结论

Redis 事务可以把多条命令打包后按顺序执行，核心命令是 `MULTI`、`EXEC`、`DISCARD`、`WATCH`，但它不等同于数据库事务。

## 通俗解释

Redis 事务像把几张工单放进一个信封，最后一次性交给 Redis 执行。执行顺序能保证，但不代表出错后自动全部撤销。

## 面试回答

Redis 事务流程：

1. `MULTI` 开启事务。
2. 后续命令进入队列。
3. `EXEC` 执行队列命令。
4. `DISCARD` 可以丢弃队列。
5. `WATCH` 可以监控 key，配合乐观锁使用。

Redis 事务保证命令按顺序执行，中间不会插入其他客户端命令。但如果某条命令运行时报错，Redis 不会像关系型数据库一样自动回滚前面已经执行的命令。

## 常见追问

### Redis 事务有 ACID 吗？

不能简单等同于数据库 ACID，尤其是回滚语义不同。

### WATCH 有什么用？

WATCH 用于监控 key，如果事务执行前 key 被其他客户端修改，事务会失败。

## 易错点

- 不要把 Redis 事务说成 MySQL 事务。
- Redis 事务不支持自动回滚已执行命令。
- 强原子逻辑很多时候更适合 Lua 脚本。

## 记忆钩子

**Redis 事务是排队执行，不是数据库回滚。**
