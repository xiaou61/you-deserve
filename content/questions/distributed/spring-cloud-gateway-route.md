---
title: "Spring Cloud Gateway 的路由是怎么匹配的？"
slug: "spring-cloud-gateway-route"
category: "分布式系统"
tags: ["Spring Cloud Gateway", "网关", "路由", "微服务"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "微服务高频"
order: 3000
summary: "理解网关路由由 predicate 判断请求是否命中，再通过 filter 处理请求和响应。"
---

## 一句话结论

Spring Cloud Gateway 的路由可以理解为“匹配条件 + 转发目标 + 过滤器链”，请求先被 predicate 判断是否命中，再经过 filter 转发到后端服务。

## 通俗解释

它像快递分拣中心。包裹来了先看地址、重量、城市这些条件，判断该进哪条传送带；进传送带前后，还可以贴标签、验身份、记录日志。

## 面试回答

Gateway 的核心概念通常有三个：

- Route：一条路由规则，包含 id、目标地址、predicate 和 filter。
- Predicate：匹配条件，比如 Path、Header、Method、Host。
- Filter：过滤器，可以在转发前后做鉴权、限流、改请求头、日志等处理。

请求进入 Gateway 后，会先匹配路由，匹配成功后进入对应过滤器链，再由底层客户端转发到目标服务。项目里常见配置是根据路径转发，比如 `/user/**` 到用户服务，`/order/**` 到订单服务。

## 常见追问

### Gateway 和 Nginx 都能转发，有什么区别？

Nginx 更偏通用反向代理和静态入口，Gateway 更贴近微服务生态，方便和服务发现、鉴权、限流、灰度等 Java 体系能力结合。

### 路由规则写错会怎样排查？

先看请求路径是否命中 predicate，再看目标服务地址是否正确，最后看 filter 是否改写了路径或请求头。

## 易错点

- 不要只说“网关就是转发”，要讲 predicate 和 filter。
- 不要把业务逻辑大量塞进网关。
- 注意路径重写和前缀剥离很容易配错。

## 记忆钩子

**Route 是路线，Predicate 是验票，Filter 是过安检。**

## 图解提示

适合画流程图：客户端请求 -> 路由匹配 -> 前置过滤器 -> 后端服务 -> 后置过滤器 -> 返回响应。
