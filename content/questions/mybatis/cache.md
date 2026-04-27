---
title: "MyBatis 一级缓存和二级缓存有什么区别？"
slug: "mybatis-cache"
category: "MyBatis"
tags: ["MyBatis", "缓存", "一级缓存", "二级缓存"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 710
summary: "从 SqlSession 和 Mapper namespace 两个作用域理解 MyBatis 缓存。"
---

## 一句话结论

MyBatis 一级缓存默认开启，作用域是 SqlSession；二级缓存作用域是 Mapper namespace，需要额外配置，实际项目里要谨慎使用。

## 通俗解释

一级缓存像你这次办事临时记在纸上的信息，只在这次会话里有效。二级缓存像部门共享资料柜，多个会话可能都能用。

共享范围越大，数据一致性问题越需要小心。

## 面试回答

一级缓存默认开启，作用域是同一个 SqlSession。同一个 SqlSession 内执行相同查询，可能直接从缓存返回。执行增删改、提交、回滚或关闭 SqlSession 后，缓存会清空。

二级缓存作用域是 Mapper namespace，可以跨 SqlSession 共享，但需要配置开启。由于它可能带来数据一致性问题，很多业务更愿意用 Redis 这类独立缓存组件，而不是强依赖 MyBatis 二级缓存。

## 常见追问

### 为什么项目里很少用二级缓存？

因为它和业务缓存、分布式环境、数据一致性控制结合起来比较复杂。真实项目通常用 Redis 做更可控的缓存。

### 一级缓存什么时候失效？

执行更新操作、提交事务、回滚事务、关闭 SqlSession 等情况会清空一级缓存。

## 易错点

- 不要说一级缓存需要手动开启。
- 不要把二级缓存说成一定推荐。
- 不要忽略缓存一致性。

## 记忆钩子

**一级缓存跟会话，二级缓存跟 Mapper；范围越大，越要小心。**
