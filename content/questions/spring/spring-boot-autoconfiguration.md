---
title: "Spring Boot 自动配置原理是什么？"
slug: "spring-boot-autoconfiguration"
category: "Spring"
tags: ["Java", "Spring Boot", "自动配置", "Starter"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 260
summary: "从 starter、条件注解和自动配置类理解 Spring Boot 为什么开箱即用。"
---

## 一句话结论

Spring Boot 自动配置通过 starter 引入依赖，再根据类路径、配置项和条件注解决定哪些 Bean 自动装配进容器。

## 通俗解释

Spring Boot 像一个智能装修系统。你装了厨房套餐，它发现你有燃气、水槽和冰箱，就自动帮你配置厨房；如果你已经自己配置了灶台，它就不再重复配置。

这里的“发现条件”就是条件注解。

## 面试回答

Spring Boot 自动配置通常可以这样理解：

1. starter 负责把一组相关依赖引入项目。
2. Spring Boot 启动时加载自动配置类。
3. 自动配置类里通过 `@ConditionalOnClass`、`@ConditionalOnMissingBean`、`@ConditionalOnProperty` 等条件注解决定是否生效。
4. 如果条件满足，就创建默认 Bean。
5. 如果用户自己定义了 Bean，很多自动配置会让位。

它的价值是减少样板配置，让常见场景开箱即用，同时又允许开发者覆盖默认行为。

## 常见追问

### starter 和自动配置是什么关系？

starter 主要负责依赖聚合，自动配置负责根据条件创建 Bean。starter 不等于自动配置，但它们经常配合出现。

### 为什么我自己定义 Bean 后默认配置不生效？

很多自动配置用了 `@ConditionalOnMissingBean`，意思是容器里没有对应 Bean 时才创建默认 Bean。

## 易错点

- 不要只说“约定大于配置”，要讲条件注解。
- 不要把 starter 说成直接创建 Bean 的东西。
- 不要忽略用户自定义 Bean 覆盖默认配置的机制。

## 记忆钩子

**自动配置就是：看依赖、看配置、看你有没有自己配；合适才帮你配。**
