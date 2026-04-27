---
title: "多个 Filter 和 Interceptor 的执行顺序怎么理解？"
slug: "filter-interceptor-order"
category: "Spring"
tags: ["Spring", "Filter", "Interceptor", "执行顺序"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目追问"
order: 2410
summary: "Filter 发生在 Servlet 容器层，Interceptor 发生在 Spring MVC 层，多个组件按注册顺序和配置顺序形成调用链。"
---

## 一句话结论

Filter 在 Servlet 容器层先执行，Interceptor 在 Spring MVC 分发到 Controller 前后执行；多个组件会按注册或配置顺序形成链式调用。

## 通俗解释

Filter 像小区大门保安，Interceptor 像办公楼前台。你先过小区门，再到办公楼前台登记。

## 面试回答

大致链路：

1. 请求进入 Servlet 容器。
2. 先经过 Filter 链。
3. 到达 DispatcherServlet。
4. Spring MVC 执行 Interceptor 的 `preHandle`。
5. 调用 Controller。
6. 执行 `postHandle` 和 `afterCompletion`。
7. 响应再经过 Filter 链返回。

Filter 更适合通用底层处理，比如编码、跨域、安全过滤；Interceptor 更适合和 Spring MVC 上下文相关的处理，比如登录检查、权限、日志。

## 常见追问

### Filter 能拿到 Spring Bean 吗？

可以通过 Spring 管理或手动注入方式实现，但它本质属于 Servlet 过滤器。

### afterCompletion 一定会执行吗？

在请求进入拦截器链后，通常用于资源清理和异常后处理，但具体要看请求是否到达对应阶段。

## 易错点

- 不要把 Filter 和 Interceptor 放在同一层。
- 顺序问题要看注册方式和配置。
- 权限校验要避免多个入口不一致。

## 记忆钩子

**Filter 是小区门，Interceptor 是办公楼前台。**
