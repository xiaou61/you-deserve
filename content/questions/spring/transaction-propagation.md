---
title: "Spring 事务传播行为怎么理解？"
slug: "spring-transaction-propagation"
category: "Spring"
tags: ["Spring", "事务", "传播行为"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 790
summary: "掌握 REQUIRED、REQUIRES_NEW、NESTED 等常见传播行为的区别。"
---

## 一句话结论

事务传播行为定义的是一个事务方法调用另一个事务方法时，内层方法应该加入外层事务、开启新事务，还是以嵌套事务运行。

## 通俗解释

传播行为像团队报销。有人已经开了一张报销单，后面的费用是放进同一张单，还是另开一张单，还是在里面开一个子单，这就是传播行为。

## 面试回答

常见传播行为：

- REQUIRED：默认行为，有事务就加入，没有就新建。
- REQUIRES_NEW：无论外面有没有事务，都挂起外层，开启新事务。
- NESTED：在当前事务中创建嵌套事务，依赖保存点。
- SUPPORTS：有事务就加入，没有就非事务执行。
- NOT_SUPPORTED：以非事务方式执行，有事务则挂起。
- MANDATORY：必须存在事务，否则报错。
- NEVER：必须没有事务，否则报错。

实际项目里最常问 REQUIRED 和 REQUIRES_NEW 的区别。

## 常见追问

### REQUIRES_NEW 有什么风险？

它会独立提交。外层事务回滚时，内层新事务已经提交的内容不会自动回滚，可能导致业务一致性问题。

### NESTED 和 REQUIRES_NEW 区别？

NESTED 是外层事务里的保存点，外层回滚会影响它。REQUIRES_NEW 是独立新事务。

## 易错点

- 不要把传播行为和隔离级别混为一谈。
- 不要忽略 REQUIRES_NEW 独立提交带来的风险。
- 自调用仍然可能导致事务不生效。

## 记忆钩子

**传播行为就是事务报销单：同一张、另开张、开子单。**
