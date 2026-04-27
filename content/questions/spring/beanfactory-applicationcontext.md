---
title: "BeanFactory 和 ApplicationContext 有什么区别？"
slug: "beanfactory-applicationcontext"
category: "Spring"
tags: ["Spring", "BeanFactory", "ApplicationContext", "IoC"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 1890
summary: "BeanFactory 是基础 IoC 容器，ApplicationContext 在其基础上提供事件、国际化、资源加载等企业级能力。"
---

## 一句话结论

BeanFactory 是 Spring 最基础的 IoC 容器，ApplicationContext 是更完整的应用上下文，提供事件、国际化、资源加载、自动装配等更多能力。

## 通俗解释

BeanFactory 像一个仓库，只负责创建和管理对象；ApplicationContext 像完整公司系统，除了仓库，还有通知、配置、资源和流程管理。

## 面试回答

BeanFactory 提供最基础的 Bean 创建、获取和依赖注入能力。

ApplicationContext 继承并扩展了 BeanFactory，常见增强包括：

- 国际化消息。
- 事件发布和监听。
- 资源加载。
- 更方便的注解和自动装配支持。
- 与 Web、AOP、事务等模块更好集成。

实际开发中，我们几乎直接使用 ApplicationContext。

## 常见追问

### BeanFactory 是不是没用了？

不是。它是 Spring IoC 的基础接口，很多能力仍建立在它之上，只是业务开发很少直接使用。

### ApplicationContext 默认什么时候创建 Bean？

大多数单例 Bean 会在容器启动时创建，当然也可以配置懒加载。

## 易错点

- 不要说二者完全无关。
- ApplicationContext 不是只多了一个名字，而是扩展了很多应用能力。
- 实际项目通常用 ApplicationContext。

## 记忆钩子

**BeanFactory 是仓库，ApplicationContext 是公司系统。**
