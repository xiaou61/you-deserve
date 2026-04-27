---
title: "Spring MVC 和 WebFlux 有什么区别？"
slug: "spring-mvc-webflux"
category: "Spring"
tags: ["Spring", "Spring MVC", "WebFlux", "响应式"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "架构选型"
order: 2390
summary: "Spring MVC 是传统 Servlet 阻塞模型，WebFlux 是响应式非阻塞模型，适合高并发 IO 场景。"
---

## 一句话结论

Spring MVC 基于 Servlet 阻塞模型，WebFlux 基于响应式非阻塞模型；普通业务用 MVC 更常见，高并发 IO 和响应式链路可考虑 WebFlux。

## 通俗解释

MVC 像一个服务员接一桌等一桌，流程直观；WebFlux 像服务员下单后不干等，去服务别的桌，菜好了再回来处理。

## 面试回答

主要区别：

- 编程模型：MVC 常用同步阻塞写法，WebFlux 使用 Mono、Flux 等响应式类型。
- 底层模型：MVC 常基于 Servlet，WebFlux 支持非阻塞运行时。
- 适用场景：MVC 适合绝大多数 CRUD 系统；WebFlux 适合高并发 IO、流式数据、服务间大量异步调用。
- 学习成本：WebFlux 对响应式思维要求更高。

如果数据库驱动、下游 SDK 仍是阻塞的，盲目上 WebFlux 收益有限。

## 常见追问

### WebFlux 一定比 MVC 快吗？

不一定。它适合 IO 密集且链路非阻塞的场景，不是所有业务都更快。

### Mono 和 Flux 是什么？

Mono 表示 0 到 1 个异步结果，Flux 表示 0 到多个异步结果。

## 易错点

- 不要为了新技术盲目替换 MVC。
- 响应式链路中混入阻塞调用会削弱收益。
- WebFlux 代码调试和理解成本更高。

## 记忆钩子

**MVC 等菜，WebFlux 下单后先去忙别的。**
