---
title: "MyBatis 动态 SQL 有哪些常用标签？"
slug: "mybatis-dynamic-sql"
category: "MyBatis"
tags: ["MyBatis", "动态 SQL", "XML", "SQL"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/项目高频"
order: 1950
summary: "MyBatis 动态 SQL 常用 if、choose、where、set、foreach 等标签，根据参数动态拼接 SQL。"
---

## 一句话结论

MyBatis 动态 SQL 通过 `if`、`choose`、`where`、`set`、`foreach` 等标签，根据入参动态生成 SQL。

## 通俗解释

动态 SQL 像点菜。用户选了什么条件，就把对应条件加进 SQL；没选的就不加。

## 面试回答

常用标签：

- `if`：条件成立才拼接片段。
- `choose/when/otherwise`：类似 switch。
- `where`：自动处理 where 和多余的 and。
- `set`：用于 update，自动处理多余逗号。
- `foreach`：遍历集合，常用于 in 查询或批量插入。
- `trim`：自定义前缀、后缀和去除规则。

动态 SQL 能减少手写拼接错误，但也要注意 SQL 可读性和参数安全。

## 常见追问

### foreach 常见用法是什么？

常用于 `where id in (...)`，把集合参数展开成多个占位符。

### 动态 SQL 会不会有 SQL 注入？

使用 `#{}` 绑定参数通常安全，使用 `${}` 字符串拼接时要非常谨慎。

## 易错点

- 不要用字符串拼接代替参数绑定。
- 动态条件太多时 SQL 可读性会下降。
- `where`、`set` 标签可以减少多余 and 和逗号问题。

## 记忆钩子

**动态 SQL 是按条件点菜，选了才上桌。**
