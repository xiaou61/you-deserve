---
title: "MyBatis 分页插件大致原理是什么？"
slug: "mybatis-pagination-plugin"
category: "MyBatis"
tags: ["MyBatis", "分页插件", "SQL 改写", "插件"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 2430
summary: "分页插件通常通过 MyBatis 拦截器改写 SQL，追加 limit 并执行 count 查询。"
---

## 一句话结论

MyBatis 分页插件通常基于插件机制拦截 SQL 执行过程，改写原 SQL，追加分页语句，并可能额外执行 count 查询。

## 通俗解释

分页插件像帮你改订单的助理。你原本说“查全部”，助理在提交前补一句“只拿第几页多少条”。

## 面试回答

常见分页插件流程：

1. 拦截 Executor 或 StatementHandler。
2. 获取原始 SQL 和分页参数。
3. 生成 count SQL 查询总数。
4. 改写原 SQL，追加 `limit`。
5. 执行分页 SQL 并封装结果。

要注意复杂 SQL 的 count 改写可能不准确或性能差，深分页也不是分页插件本身能完全解决的。

## 常见追问

### 分页插件能解决深分页慢吗？

不能彻底解决。它只是帮你加 limit，深分页扫描和丢弃大量数据的问题仍然存在。

### count SQL 为什么可能慢？

复杂 join、group by、大表条件过滤都会让 count 成本很高。

## 易错点

- 不要以为用了分页插件就没有性能问题。
- count 查询也要优化。
- 分页参数必须做上限限制，防止一次查太多。

## 记忆钩子

**分页插件是 SQL 助理，会加 limit，也可能多查 count。**
