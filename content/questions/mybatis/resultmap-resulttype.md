---
title: "MyBatis resultType 和 resultMap 有什么区别？"
slug: "mybatis-resulttype-resultmap"
category: "MyBatis"
tags: ["MyBatis", "resultType", "resultMap", "映射"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1150
summary: "区分简单自动映射和复杂自定义映射。"
---

## 一句话结论

resultType 适合简单结果自动映射；resultMap 适合字段名不一致、嵌套对象、一对多等复杂映射。

## 通俗解释

resultType 像按默认规则填表，字段名对得上就能填。resultMap 像自定义填表说明，哪一列填哪个属性都写清楚。

## 面试回答

resultType 直接指定返回类型，MyBatis 会根据列名和属性名自动映射。适合字段名和属性名比较一致的简单场景。

resultMap 可以显式配置列和属性的对应关系，也可以处理关联对象、集合、一对一、一对多等复杂结果。

## 常见追问

### 字段名 user_name 和属性 userName 怎么映射？

可以开启驼峰映射，也可以用 resultMap 显式配置。

### 一对多查询用什么？

通常用 resultMap 的 collection，或拆成多次查询后在业务层组装。

## 易错点

- 不要复杂映射还硬用 resultType。
- 不要忽略驼峰映射配置。
- 一对多 join 可能导致结果集膨胀。

## 记忆钩子

**resultType 默认填，resultMap 按说明填。**
