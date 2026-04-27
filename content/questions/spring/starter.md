---
title: "Spring Boot Starter 是什么？"
slug: "spring-boot-starter"
category: "Spring"
tags: ["Spring Boot", "Starter", "自动配置"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1130
summary: "理解 starter 是依赖聚合和自动配置入口，不是魔法。"
---

## 一句话结论

Spring Boot Starter 是一组依赖和自动配置的聚合入口，让开发者引入一个 starter 就能快速获得某类能力。

## 通俗解释

starter 像套餐。你想做 Web 项目，点一个 Web 套餐，它把常用依赖和默认配置都准备好，不用一个个点菜。

## 面试回答

starter 通常包含相关依赖，并配合自动配置类生效。比如 web starter 会引入 Spring MVC、内嵌服务器、JSON 处理等依赖。

它的价值是降低配置成本，但不是不可修改。用户可以通过配置文件、自定义 Bean 等方式覆盖默认行为。

## 常见追问

### starter 和自动配置一样吗？

不一样。starter 偏依赖聚合，自动配置负责根据条件创建 Bean。它们经常配合使用。

### 自定义 starter 需要什么？

通常需要自动配置类、配置属性类、条件注解和 starter 依赖包装。

## 易错点

- 不要说 starter 本身直接完成所有配置。
- 不要忽略条件装配。
- 不要把 starter 当成黑盒魔法。

## 记忆钩子

**starter 是套餐，自动配置是厨师按条件上菜。**
