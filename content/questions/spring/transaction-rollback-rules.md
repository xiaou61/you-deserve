---
title: "Spring 事务回滚规则是什么？"
slug: "spring-transaction-rollback-rules"
category: "Spring"
tags: ["Spring", "事务", "回滚", "异常"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 2370
summary: "Spring 默认对运行时异常和 Error 回滚，对受检异常不自动回滚，可通过 rollbackFor 配置。"
---

## 一句话结论

Spring 声明式事务默认对 RuntimeException 和 Error 回滚，对受检异常不自动回滚，可以通过 `rollbackFor` 指定回滚规则。

## 通俗解释

事务回滚像撤销订单。系统默认认为严重故障要撤销，但普通提醒类异常不一定撤销，除非你明确告诉它。

## 面试回答

默认规则：

- RuntimeException：回滚。
- Error：回滚。
- Checked Exception：默认不回滚。

如果业务希望遇到受检异常也回滚，可以写：

```java
@Transactional(rollbackFor = Exception.class)
```

项目里常见事务不回滚问题，就是异常被 catch 了没有继续抛出，或者抛的是受检异常但没配置回滚。

## 常见追问

### catch 异常后事务还会回滚吗？

如果 catch 后没有抛出异常，Spring 事务拦截器感知不到失败，通常不会回滚。

### 所有方法都加 rollbackFor = Exception.class 好吗？

不一定。要根据业务语义配置，避免不该回滚的流程被回滚。

## 易错点

- 默认不对所有 Exception 都回滚。
- 异常被吞掉会导致事务正常提交。
- 回滚规则要和业务异常体系配合。

## 记忆钩子

**事务默认见运行时异常才撤单，受检异常要提前说明。**
