---
title: "Seata AT 模式大致怎么保证分布式事务？"
slug: "seata-at-transaction"
category: "分布式系统"
tags: ["Seata", "分布式事务", "AT 模式", "一致性"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "微服务深挖"
order: 3080
summary: "Seata AT 模式通过全局事务协调、本地事务提交和 undo log 回滚来实现最终一致的分布式事务。"
---

## 一句话结论

Seata AT 模式通过事务协调器管理全局事务，各分支先提交本地事务并记录 undo log，失败时再用 undo log 反向补偿回滚。

## 通俗解释

它像多人合买东西。每个人先把自己的付款小票留好，如果最后有人失败，组织者就按小票逐个退款。

## 面试回答

AT 模式可以按两阶段理解：

第一阶段：

- 业务服务开启全局事务。
- 每个参与服务执行本地 SQL。
- Seata 代理数据源记录 before image 和 after image，生成 undo log。
- 本地事务提交，释放本地锁。

第二阶段：

- 如果全局成功，异步删除 undo log。
- 如果全局失败，根据 undo log 反向生成 SQL 回滚。

它的优点是对业务侵入相对低，适合常见关系型数据库场景。缺点是依赖代理数据源、undo log 和全局锁，对复杂 SQL、长事务、高并发场景要谨慎。

## 常见追问

### AT 模式和 TCC 有什么区别？

AT 更偏自动代理 SQL，业务侵入低；TCC 要业务自己实现 Try、Confirm、Cancel，侵入高但控制力更强。

### 为什么要记录 before image 和 after image？

before image 用于失败回滚，after image 用于校验数据是否被其他事务修改，避免脏回滚。

## 易错点

- 不要说 Seata 能无脑解决所有分布式事务。
- 不要忽略 undo log 和全局锁。
- 长事务和高并发热点数据不适合随便套 AT。

## 记忆钩子

**AT 像留小票：先办事，失败按小票退款。**

## 图解提示

适合画时序图：业务服务 -> TC 开全局事务 -> 分支提交并写 undo log -> 全局提交或回滚。
