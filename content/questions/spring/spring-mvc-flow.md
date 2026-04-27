---
title: "Spring MVC 一次请求的执行流程是什么？"
slug: "spring-mvc-flow"
category: "Spring"
tags: ["Java", "Spring MVC", "DispatcherServlet", "Web"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 250
summary: "围绕 DispatcherServlet、HandlerMapping、HandlerAdapter 和 Controller 串起请求链路。"
---

## 一句话结论

Spring MVC 的核心入口是 `DispatcherServlet`，它负责接收请求、查找处理器、调用 Controller、处理返回结果，最后生成响应。

## 通俗解释

一次请求像去医院看病。前台先接待你，然后根据科室规则找到医生，再由医生看病开结果，最后前台把结果整理给你。

`DispatcherServlet` 就是前台调度员，Controller 是真正处理业务的医生。

## 面试回答

典型流程是：

1. 请求进入 `DispatcherServlet`。
2. 通过 `HandlerMapping` 找到匹配的 Handler，也就是 Controller 方法。
3. 通过 `HandlerAdapter` 调用具体方法。
4. 方法执行前后可能经过拦截器。
5. Controller 返回数据或视图。
6. Spring MVC 通过消息转换器把对象转换成 JSON 等响应格式。
7. 响应返回客户端。

如果是前后端分离项目，常见的是 Controller 返回对象，然后由 `HttpMessageConverter` 转成 JSON。

## 常见追问

### 拦截器和过滤器有什么区别？

过滤器属于 Servlet 规范，进入 Spring MVC 前就能拦截。拦截器属于 Spring MVC，主要围绕 Handler 执行前后做增强。

### 为什么需要 HandlerAdapter？

因为 Controller 的形态可能不同，HandlerAdapter 用适配器模式屏蔽调用差异，让 DispatcherServlet 不必关心具体调用细节。

## 易错点

- 不要只说 Controller 处理请求，要把 DispatcherServlet 讲出来。
- 不要把 Filter 和 Interceptor 混为一谈。
- 前后端分离项目重点说 JSON 转换，不要一直讲传统视图解析。

## 记忆钩子

**DispatcherServlet 是总调度：找人、叫人、收结果、回响应。**
