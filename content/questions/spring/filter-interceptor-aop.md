---
title: "Filter、Interceptor、AOP 有什么区别？"
slug: "filter-interceptor-aop"
category: "Spring"
tags: ["Spring", "Filter", "Interceptor", "AOP"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/项目高频"
order: 1120
summary: "从所属体系、执行位置和适用场景区分过滤器、拦截器和切面。"
---

## 一句话结论

Filter 属于 Servlet 规范，最靠近 Web 容器；Interceptor 属于 Spring MVC，围绕 Controller 请求；AOP 属于 Spring 代理机制，围绕方法增强。

## 通俗解释

Filter 像小区大门，所有进出都先过它。Interceptor 像楼栋门禁，只管进这栋楼的人。AOP 像办公室里的流程模板，方法执行前后加日志、事务等。

## 面试回答

区别：

- Filter：Servlet 规范，作用在请求进入 Spring MVC 之前，适合编码、跨域、简单鉴权。
- Interceptor：Spring MVC 机制，作用在 Handler 执行前后，能拿到 Handler 信息，适合登录校验、权限、日志。
- AOP：Spring 代理增强，作用在 Bean 方法调用上，适合事务、日志、监控等横切逻辑。

执行顺序通常是 Filter 更靠外，Interceptor 在 Spring MVC 内部，AOP 围绕具体 Bean 方法。

## 常见追问

### 拦截器能拦截静态资源吗？

取决于 Spring MVC 配置和资源处理路径。Filter 更底层，范围通常更广。

### AOP 能拦截所有方法吗？

Spring AOP 主要拦截 Spring 容器里的 Bean 方法，自调用等场景可能失效。

## 易错点

- 不要把三者都说成“拦截请求”。
- 不要忽略所属体系不同。
- 不要忘记 AOP 代理限制。

## 记忆钩子

**Filter 看大门，Interceptor 看 Controller，AOP 看方法。**
