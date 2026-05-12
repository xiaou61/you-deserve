---
title: 多个 Filter 和 Interceptor 的执行顺序怎么理解？
slug: filter-interceptor-order
category: Spring
tags:
  - Spring
  - Filter
  - Interceptor
  - 执行顺序
difficulty: medium
route: Java 后端上岸路线
scene: 项目追问
order: 2410
summary: Filter 发生在 Servlet 容器层，Interceptor 发生在 Spring MVC 层，多个组件按注册顺序和配置顺序形成调用链。
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

### postHandle 一定会执行吗？

不一定。Controller 抛异常或 preHandle 短路时，postHandle 可能不执行，因此清理资源不要依赖它。

### afterCompletion 适合做什么？

适合记录最终耗时、清理 ThreadLocal、释放上下文，因为它更接近请求完成的收尾阶段。

### Filter 的后置逻辑怎么保证执行？

用 try/finally 包住 chain.doFilter，避免下游异常导致上下文无法清理。

### Filter 和 Interceptor 顺序能混排吗？

不能跨层混排。Filter 永远在 Servlet 容器层，Interceptor 在 DispatcherServlet 调度之后。

## 易错点

- 不要把 Filter 和 Interceptor 放在同一层。
- 顺序问题要看注册方式和配置。
- 权限校验要避免多个入口不一致。

## 详细讲解

多个 Filter 和 Interceptor 的执行顺序怎么理解 这类题不该答成“注解识别题”，而应该答成“请求链路题”。先用一句话压住重点，比如 Filter 发生在 Servlet 容器层，Interceptor 发生在 Spring MVC 层，多个组件按注册顺序和配置顺序形成调用链，然后把读者带回一次真实请求：从 Servlet 容器收进来，经过 Spring MVC 调度、参数解析、方法调用、返回值处理，再把响应吐出去。只要请求链画得出来，很多小问题就会自己找到位置。

最稳的讲法是沿着 DispatcherServlet 往下走。先看请求如何匹配到 Handler，再看谁负责调用方法、谁负责把请求参数转换成 Java 对象、谁负责把返回值转换成 JSON 或视图，最后再补上异常处理、拦截器回调和响应提交时机。像 请求进入 Servlet 容器 这种主线，只要讲成“流经哪些节点、每个节点负责什么”，内容就会很顺。

这类题里真正容易混的，是几个相邻环节职责很像但边界不同。参数解析不是消息转换，过滤器不等于拦截器，视图解析和 @ResponseBody 也不在一条分支上。只要边界说模糊，后面一旦被追问 415、406、参数丢失、拦截器不执行、异常没接住，就很容易乱。像 不要把 Filter 和 Interceptor 放在同一层 这种提醒，核心就是要把“它在哪一层发生”讲准。

继续深挖时，通常会问“postHandle 一定会执行吗”和“afterCompletion 适合做什么”。这里最有说服力的证据不是概念，而是链路观测：会看访问日志、Spring MVC debug 日志、HandlerMapping 匹配结果、拦截器执行顺序、参数绑定异常、消息转换器选择结果、异常解析器是否接住、最终 HTTP 状态码和响应体。Web 层题的排查习惯，本质上就是沿请求方向一站一站往下排。

如果放回业务现场，这些点会长成很具体的问题。比如 @RequestBody 对不上 Content-Type 时会报 415，返回对象没找到可用 converter 时会报 406，拦截器路径没配对时权限逻辑会失效，统一异常处理没命中时前端会拿到默认错误页，参数解析器写得太激进时会把原有方法签名全打乱。把故障现象说出来，读者对整个 MVC 链就会有手感。

这一层也有取舍。Spring MVC 帮你把大部分 Web 细节抽掉了，但抽象越多，定位问题就越依赖你能不能把链路拆开。像 不要把 Filter 和 Interceptor 放在同一层 这种坑背后，其实是在提醒：别把“都在 Web 层发生”当成“它们是一回事”。只有职责边界清楚，出了问题才能知道先看容器入口、MVC 调度、控制器参数，还是响应输出。

最后收口时，把 多个 Filter 和 Interceptor 的执行顺序怎么理解 讲成“请求从哪里进、在哪分叉、出了错卡在哪、拿什么证据确认”的闭环就够了。这样答案既有流程，也有排障抓手，面试官会更容易判断你是真走过请求链，而不是只背过 Controller 注解。

## 图解提示

适合画一张 Spring MVC 请求链图：请求进入容器 -> Filter -> DispatcherServlet -> HandlerMapping/HandlerAdapter -> Controller -> 返回值处理或异常处理 -> 响应返回。图里单独圈出 请求进入 Servlet 容器、先经过 Filter 链 和 不要把 Filter 和 Interceptor 放在同一层，这样最容易讲清楚每一层到底负责什么。

## 记忆钩子

**Filter 是小区门，Interceptor 是办公楼前台。**
