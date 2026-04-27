---
title: "Spring Bean 有哪些作用域？"
slug: "spring-bean-scope"
category: "Spring"
tags: ["Spring", "Bean", "作用域"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1100
summary: "理解 singleton、prototype 以及 Web 场景下 request/session 作用域。"
---

## 一句话结论

Spring Bean 最常见作用域是 singleton 和 prototype。singleton 是容器内单例，prototype 每次获取创建新对象；Web 场景还有 request、session 等作用域。

## 通俗解释

singleton 像公司共用一台打印机，大家都用同一个。prototype 像每个人领一支新笔，每次都发新的。

## 面试回答

常见作用域：

- singleton：默认作用域，一个 Spring 容器中只有一个 Bean 实例。
- prototype：每次从容器获取都会创建新实例。
- request：一次 HTTP 请求一个实例。
- session：一次 HTTP Session 一个实例。

单例 Bean 如果有可变成员变量，要注意线程安全问题。Spring 单例不是 Java 设计模式里的 JVM 全局单例，它只是在容器范围内单例。

## 常见追问

### prototype Bean 的销毁由 Spring 管吗？

Spring 负责创建和初始化 prototype Bean，但通常不负责完整生命周期销毁，需要业务自己处理资源释放。

### 单例 Bean 线程安全吗？

不一定。如果 Bean 无状态通常安全；如果有共享可变状态，就要自己保证线程安全。

## 易错点

- 不要把 Spring singleton 说成 JVM 全局单例。
- 不要认为单例 Bean 一定线程安全。
- 不要忘记 prototype 销毁管理问题。

## 记忆钩子

**singleton 共用一个，prototype 每次新的。**
