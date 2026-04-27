---
title: "@Autowired 和 @Resource 有什么区别？"
slug: "autowired-resource"
category: "Spring"
tags: ["Spring", "依赖注入", "Autowired", "Resource"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1110
summary: "区分按类型注入、按名称注入和来源规范。"
---

## 一句话结论

`@Autowired` 是 Spring 提供的，默认按类型注入；`@Resource` 来自 Java 规范，默认按名称注入，名称找不到再按类型匹配。

## 通俗解释

按类型像说“给我一个程序员”，按名称像说“我要张三”。如果有多个程序员，光说类型就可能不知道该找谁。

## 面试回答

`@Autowired` 默认按类型注入。如果同一类型有多个 Bean，需要配合 `@Qualifier` 或使用字段名、参数名辅助匹配。

`@Resource` 默认按名称查找 Bean，找不到时再按类型。它不是 Spring 独有注解。

实际项目中更推荐构造器注入，依赖更清晰，也方便测试。

## 常见追问

### 有多个同类型 Bean 怎么办？

可以用 `@Qualifier` 指定 Bean 名称，也可以用 `@Primary` 指定默认优先 Bean。

### 字段注入有什么问题？

隐藏依赖，不方便单元测试，也不利于创建不可变对象。

## 易错点

- 不要说 @Autowired 永远只按类型，不看名称。
- 不要忽略 @Resource 默认按名称。
- 不要把注入方式选择只看写法方便。

## 记忆钩子

**Autowired 先看类型，Resource 先叫名字。**
