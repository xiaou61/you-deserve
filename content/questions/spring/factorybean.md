---
title: "FactoryBean 是什么？"
slug: "factorybean"
category: "Spring"
tags: ["Spring", "FactoryBean", "IoC", "扩展点"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面加分"
order: 2360
summary: "FactoryBean 是一种特殊 Bean，它本身是工厂，容器获取它时通常返回工厂生产的对象。"
---

## 一句话结论

FactoryBean 是 Spring 提供的特殊 Bean，它本身是工厂，容器获取时默认返回它生产出来的对象，而不是工厂对象本身。

## 通俗解释

普通 Bean 像货架上的商品，FactoryBean 像一台机器。你找它要东西时，拿到的通常是机器生产出的商品。

## 面试回答

FactoryBean 常用于创建复杂对象，尤其是对象创建过程不能简单通过构造器或属性注入完成时。

它常见方法：

- `getObject()`：返回真正要暴露的对象。
- `getObjectType()`：返回对象类型。
- `isSingleton()`：是否单例。

如果想获取 FactoryBean 本身，需要在 Bean 名称前加 `&`。

## 常见追问

### FactoryBean 和普通工厂模式有什么关系？

它是 Spring 容器里的工厂模式实现，容器负责管理工厂和产品对象。

### MyBatis 里有没有类似应用？

Mapper 代理对象的创建就体现了类似思想，接口本身没有实现类，但运行时能拿到代理对象。

## 易错点

- FactoryBean 不是 BeanFactory。
- 默认拿到的是产品对象，不是工厂本身。
- 适合复杂对象创建，不要滥用。

## 记忆钩子

**FactoryBean 是容器里的造物机器。**
