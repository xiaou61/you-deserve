---
title: "MyBatis 插件机制是什么？"
slug: "mybatis-plugin-interceptor"
category: "MyBatis"
tags: ["MyBatis", "插件", "拦截器", "分页"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面加分"
order: 1940
summary: "MyBatis 插件通过拦截 Executor、StatementHandler 等核心对象的方法，实现分页、审计、SQL 改写等扩展。"
---

## 一句话结论

MyBatis 插件机制本质是拦截核心对象的方法调用，通过动态代理在执行 SQL 的关键流程中插入扩展逻辑。

## 通俗解释

它像在流水线关键位置装检查员。SQL 执行前后，检查员可以记录日志、改分页、统计耗时。

## 面试回答

MyBatis 插件可以拦截一些核心对象：

- Executor。
- StatementHandler。
- ParameterHandler。
- ResultSetHandler。

常见用途包括分页插件、SQL 日志、数据权限、慢 SQL 统计等。

插件通常通过 `Interceptor` 实现，在目标方法执行前后做增强。分页插件常会拦截 SQL 执行过程，改写 SQL 并追加 limit。

## 常见追问

### 插件能随便拦截任何方法吗？

不能。MyBatis 插件只能拦截框架开放的特定核心对象和方法。

### 插件有什么风险？

SQL 改写不当可能导致性能问题或语义错误，多个插件顺序也可能互相影响。

## 易错点

- 不要把 MyBatis 插件理解成 Spring AOP 的完全替代。
- 插件拦截点有限。
- SQL 改写要谨慎，尤其是复杂查询。

## 记忆钩子

**MyBatis 插件是在 SQL 流水线装检查员。**
