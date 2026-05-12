---
title: MyBatis 插件机制是什么？
slug: mybatis-plugin-interceptor
category: MyBatis
tags:
  - MyBatis
  - 插件
  - 拦截器
  - 分页
difficulty: hard
route: Java 后端上岸路线
scene: 二面加分
order: 1940
summary: MyBatis 插件通过拦截 Executor、StatementHandler 等核心对象的方法，实现分页、审计、SQL 改写等扩展。
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

### MyBatis 题最容易和什么混在一起？

最常见的是把框架行为和数据库行为混成一件事。像「MyBatis 插件机制是什么」这种题，最好主动区分：这部分是 MyBatis 层做的，这部分是 JDBC 或 MySQL 自己决定的。

### 排查时先看 mapper 还是先看数据库？

通常两边都要看：先看最终生成的 SQL 和参数，再看执行计划、慢日志、事务边界和连接池状态。只盯 XML 或只盯数据库都容易漏真因。

### 为什么很多问题只在线上才明显？

因为数据量、事务长度、并发度和缓存命中情况跟本地完全不是一个量级。答题时把这句讲出来，面试官一般就知道你踩过坑。

### 怎么把这题讲得更像实战？

别只说注解或标签名，可以顺手补一句：如果 MyBatis 插件机制是什么 真出问题，我会如何定位最终 SQL、怎么验证影响范围、改完以后看什么指标。

## 易错点

- 不要把 MyBatis 插件理解成 Spring AOP 的完全替代。
- 插件拦截点有限。
- SQL 改写要谨慎，尤其是复杂查询。

## 详细讲解

MyBatis 插件机制是什么？ 核心结论是：MyBatis 插件通过拦截 Executor、StatementHandler 等核心对象的方法，实现分页、审计、SQL 改写等扩展。回答时先把它放回MyBatis语境，说明它解决什么矛盾，再围绕SQL 生成、参数绑定、执行器行为、缓存边界和日志排查展开。

第一步是拆清问题背景。它像在流水线关键位置装检查员。SQL 执行前后，检查员可以记录日志、改分页、统计耗时。在MyBatis题里，背景不能写成空泛的工程套话，而要落到从 Mapper 方法、MappedStatement、BoundSql、Executor、StatementHandler 和结果映射讲清调用链。如果只说“看场景”或“加组件”，读者很难知道下一步该检查什么；如果能把输入、状态、依赖和输出说清，答案就有了主线。

第二步是讲机制。可以围绕这些点展开：Executor。；StatementHandler。；ParameterHandler。；ResultSetHandler。。每个点都要回答三个问题：它在链路里的位置是什么，它改变了什么状态，失败或边界条件下会留下什么现象。把这三件事讲清楚，追问从概念跳到实战时就不会断。

第三步是补边界。这里尤其要主动说明SQL 注入、一级缓存作用域、二级缓存一致性、批处理 flush、插件顺序和线程安全。不要把 MyBatis 插件理解成 Spring AOP 的完全替代。；插件拦截点有限。；SQL 改写要谨慎，尤其是复杂查询。很多八股答案的问题不是方向错，而是没有说适用范围；一旦遇到数据规模变化、异常分支或版本差异，原来的结论就可能不成立。

第四步是补专项深度：补 Interceptor、Invocation、Plugin.wrap、@Intercepts/@Signature、拦截器链顺序、只拦截 MyBatis 开放方法、多个插件改写 SQL 的冲突和性能成本。这部分适合放在面试回答后半段，用来证明你不仅知道标准答案，也知道高频追问会往哪里挖。

最后收束成一套回答节奏：先给结论，再讲机制，再补边界，最后说验证方式。对这题来说，验证可以看最终 SQL、参数绑定日志、执行器类型、缓存命中、慢 SQL、连接池和事务边界；方案选择可以和XML、注解、动态 SQL、插件、TypeHandler、分页插件或手写 SQL对比。这样既保留八股题的清晰度，也能把答案讲成可落地、可排查、可复盘的经验。

## 图解提示

适合画一张调用链图：业务方法发起 -> Mapper/SQL 生成 -> JDBC 执行 -> 数据库返回 -> 补上 不要把 MyBatis 插件理解成 Spring AOP 的完全替代 -> 最后放排查入口。图里最好同时出现“最终 SQL”和“数据库行为”，这样不会悬空。

## 记忆钩子

**MyBatis 插件是在 SQL 流水线装检查员。**
