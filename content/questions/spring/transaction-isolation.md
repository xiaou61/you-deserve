---
title: "Spring 事务隔离级别怎么配置？"
slug: "spring-transaction-isolation"
category: "Spring"
tags: ["Spring", "事务", "隔离级别", "数据库"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 1480
summary: "Spring 事务隔离级别本质还是数据库隔离级别，配置在 @Transactional 的 isolation 属性上。"
---

## 一句话结论

Spring 可以通过 `@Transactional(isolation = ...)` 指定事务隔离级别，但真正执行效果取决于底层数据库是否支持。

## 通俗解释

Spring 像点餐系统，数据库像厨房。你可以在系统里备注“少油少盐”，但厨房能不能完全做到，还得看厨房能力。

## 面试回答

Spring 事务隔离级别常见配置在 `@Transactional` 上：

- `DEFAULT`：使用数据库默认隔离级别。
- `READ_UNCOMMITTED`：可能读到未提交数据。
- `READ_COMMITTED`：避免脏读。
- `REPEATABLE_READ`：避免脏读和不可重复读，MySQL 默认常见是这个级别。
- `SERIALIZABLE`：串行化，隔离最强，并发性能最低。

面试回答时要说明：Spring 只是把隔离级别传给数据库，最终语义要看数据库实现。比如 MySQL InnoDB 在可重复读下还通过 MVCC 和间隙锁处理很多并发问题。

## 常见追问

### 隔离级别越高越好吗？

不是。隔离越强，并发性能通常越差，要根据业务一致性要求选择。

### 默认隔离级别是什么？

Spring 的 `DEFAULT` 表示使用数据库默认值，不是 Spring 自己定义一个固定级别。

## 易错点

- 不要说隔离级别是 Spring 自己实现的。
- 不要所有场景都设置成最高隔离级别。
- 要结合数据库事务知识一起回答。

## 记忆钩子

**Spring 负责下单，数据库负责真正隔离。**
