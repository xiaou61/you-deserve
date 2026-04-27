---
title: "@Conditional 注解有什么用？"
slug: "spring-conditional-annotation"
category: "Spring"
tags: ["Spring", "@Conditional", "自动配置", "条件装配"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "Spring Boot 原理追问"
order: 1920
summary: "@Conditional 用于按条件决定 Bean 是否装配，是 Spring Boot 自动配置的重要基础。"
---

## 一句话结论

`@Conditional` 用来根据条件决定某个 Bean 或配置类是否生效，是 Spring Boot 自动配置能按需装配的关键机制。

## 通俗解释

它像开关规则。只有满足“仓库里有某个依赖”“配置里打开某个开关”时，Spring 才把这个组件装进系统。

## 面试回答

`@Conditional` 的核心是条件匹配。Spring 在注册 Bean 时，会判断条件是否成立，成立才装配。

Spring Boot 在它基础上提供了很多常见条件注解：

- `@ConditionalOnClass`：类路径下存在某个类才生效。
- `@ConditionalOnMissingBean`：容器里没有某个 Bean 才生效。
- `@ConditionalOnProperty`：配置项满足条件才生效。
- `@ConditionalOnBean`：容器里存在某个 Bean 才生效。

这些注解让 starter 可以做到“引入依赖后自动配置，但用户自定义时又能让用户优先”。

## 常见追问

### @ConditionalOnMissingBean 为什么常见？

它能让默认配置在用户没有自定义 Bean 时生效，一旦用户自己提供 Bean，就让用户配置优先。

### 自动配置是不是强制生效？

不是。自动配置通常会结合条件注解，满足条件才生效。

## 易错点

- 不要把条件装配理解成运行时每次调用都判断。
- 条件判断主要发生在容器装配阶段。
- Spring Boot 自动配置不是无脑装配。

## 记忆钩子

**Conditional 是装配开关：条件满足才上车。**
