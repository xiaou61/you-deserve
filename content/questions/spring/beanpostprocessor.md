---
title: "BeanPostProcessor 是什么？"
slug: "beanpostprocessor"
category: "Spring"
tags: ["Spring", "BeanPostProcessor", "Bean 生命周期", "扩展点"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "二面高频"
order: 2350
summary: "BeanPostProcessor 是 Spring Bean 初始化前后的扩展点，很多框架能力都依赖它增强 Bean。"
---

## 一句话结论

BeanPostProcessor 是 Spring 在 Bean 初始化前后提供的扩展点，可以对 Bean 进行增强、包装或代理。

## 通俗解释

它像产品出厂前后的质检员。Bean 创建出来后，正式交付使用前，质检员可以贴标签、加包装、做改造。

## 面试回答

BeanPostProcessor 有两个典型时机：

- 初始化前：`postProcessBeforeInitialization`。
- 初始化后：`postProcessAfterInitialization`。

很多 Spring 能力都和它有关，比如 AOP 代理创建、注解处理、生命周期增强等。

它发生在 Bean 生命周期中，是理解 Spring 扩展机制的重要入口。

## 常见追问

### BeanPostProcessor 和 BeanFactoryPostProcessor 区别？

BeanFactoryPostProcessor 处理 Bean 定义元数据，发生更早；BeanPostProcessor 处理已经创建出来的 Bean 实例。

### AOP 代理大概在哪个阶段创建？

通常会在 Bean 初始化后通过后置处理器创建代理对象。

## 易错点

- 不要把它理解成普通业务拦截器。
- 它是容器级扩展点，影响 Bean 创建过程。
- 扩展时要注意不要误伤所有 Bean。

## 记忆钩子

**BeanPostProcessor 是 Bean 出厂前后的质检员。**
