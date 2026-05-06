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

### 这题最容易被追问的边界是什么？

重点说清SQL 注入、一级缓存作用域、二级缓存一致性、批处理 flush、插件顺序和线程安全。不要只给结论，要说明哪些条件下结论成立，哪些条件下会退化或需要换方案。

### 怎么证明自己不是在背模板？

用最终 SQL、参数绑定日志、执行器类型、缓存命中、慢 SQL、连接池和事务边界做验证。能说出具体信号、反例或排查入口，答案就从概念层进入实战层。

### 和相近方案怎么区分？

可以拿XML、注解、动态 SQL、插件、TypeHandler、分页插件或手写 SQL对比，从SQL 可控性、注入风险、缓存一致性、性能和维护成本几个维度选择。

### 面试官继续深挖时怎么展开？

先围绕“Executor。”讲清主链路，再补“补 Interceptor、Invocation、Plugin.wrap、@Intercepts/@Signature、拦截器链顺序、只拦截 MyBatis 开放方法、多个插件改写 SQL 的冲突和性能成本”。如果能把边界条件、异常分支和验证闭环连起来，就能接住二面、三面的追问。

## 易错点

- 不要把 MyBatis 插件理解成 Spring AOP 的完全替代。
- 插件拦截点有限。
- SQL 改写要谨慎，尤其是复杂查询。

## 详细讲解

MyBatis 插件机制是什么？ 这道题现在要从“能背出来”修到“能接住追问”。核心结论是：MyBatis 插件通过拦截 Executor、StatementHandler 等核心对象的方法，实现分页、审计、SQL 改写等扩展。回答时先把它放回MyBatis语境，说明它解决什么矛盾，再围绕SQL 生成、参数绑定、执行器行为、缓存边界和日志排查展开。这样能避免泛泛而谈，也能让面试官听出你知道这题的真实边界。

第一步是拆清问题背景。它像在流水线关键位置装检查员。SQL 执行前后，检查员可以记录日志、改分页、统计耗时。在MyBatis题里，背景不能写成空泛的工程套话，而要落到从 Mapper 方法、MappedStatement、BoundSql、Executor、StatementHandler 和结果映射讲清调用链。如果只说“看场景”或“加组件”，读者很难知道下一步该检查什么；如果能把输入、状态、依赖和输出说清，答案就有了主线。

第二步是讲机制。可以围绕这些点展开：Executor。；StatementHandler。；ParameterHandler。；ResultSetHandler。。每个点都要回答三个问题：它在链路里的位置是什么，它改变了什么状态，失败或边界条件下会留下什么现象。把这三件事讲清楚，追问从概念跳到实战时就不会断。

第三步是补边界。这里尤其要主动说明SQL 注入、一级缓存作用域、二级缓存一致性、批处理 flush、插件顺序和线程安全。不要把 MyBatis 插件理解成 Spring AOP 的完全替代。；插件拦截点有限。；SQL 改写要谨慎，尤其是复杂查询。很多八股答案的问题不是方向错，而是没有说适用范围；一旦遇到数据规模变化、异常分支或版本差异，原来的结论就可能不成立。

第四步是补专项深度：补 Interceptor、Invocation、Plugin.wrap、@Intercepts/@Signature、拦截器链顺序、只拦截 MyBatis 开放方法、多个插件改写 SQL 的冲突和性能成本。这部分适合放在面试回答后半段，用来证明你不仅知道标准答案，也知道高频追问会往哪里挖。

最后收束成一套回答节奏：先给结论，再讲机制，再补边界，最后说验证方式。对这题来说，验证可以看最终 SQL、参数绑定日志、执行器类型、缓存命中、慢 SQL、连接池和事务边界；方案选择可以和XML、注解、动态 SQL、插件、TypeHandler、分页插件或手写 SQL对比。这样既保留八股题的清晰度，也能把答案讲成可落地、可排查、可复盘的经验。

## 图解提示

适合画一张结构图：进入Mapper代理 -> Executor -> StatementHandler -> 确认SQL路径 -> 映射返回结果 -> 查看日志证据。画面重点突出：MyBatis 插件机制是什么？ 不是孤立概念，要把核心机制、边界风险、异常处理和验证证据放在同一张图里。

## 记忆钩子

**MyBatis 插件是在 SQL 流水线装检查员。**
