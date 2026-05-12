---
title: Filter、Interceptor、AOP 有什么区别？
slug: filter-interceptor-aop
category: Spring
tags:
  - Spring
  - Filter
  - Interceptor
  - AOP
difficulty: medium
route: Java 后端上岸路线
scene: 一面/项目高频
order: 1120
summary: 从所属体系、执行位置和适用场景区分过滤器、拦截器和切面。
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

### 静态资源会经过 Interceptor 吗？

不一定。取决于资源处理和拦截路径配置。Filter 更靠前，通常更容易覆盖静态资源和非 MVC 请求。

### preHandle 返回 false 会怎样？

Controller 不会继续执行，通常要在 preHandle 内自己写响应或交给上层统一处理，否则客户端可能拿到空响应。

### AOP 为什么会自调用失效？

同类内部 this.method 调用没有经过 Spring 代理对象，所以切面、事务、异步等增强都不会触发。

### 三者都能做鉴权时怎么选？

入口粗过滤和安全防线放 Filter，基于 Handler 的接口权限放 Interceptor，方法级权限或注解语义放 AOP。

## 易错点

- 不要把三者都说成“拦截请求”。
- 不要忽略所属体系不同。
- 不要忘记 AOP 代理限制。

## 详细讲解

Filter、Interceptor、AOP 有什么区别 这类题不该答成“注解识别题”，而应该答成“请求链路题”。先用一句话压住重点，比如 从所属体系、执行位置和适用场景区分过滤器、拦截器和切面，然后把读者带回一次真实请求：从 Servlet 容器收进来，经过 Spring MVC 调度、参数解析、方法调用、返回值处理，再把响应吐出去。只要请求链画得出来，很多小问题就会自己找到位置。

最稳的讲法是沿着 DispatcherServlet 往下走。先看请求如何匹配到 Handler，再看谁负责调用方法、谁负责把请求参数转换成 Java 对象、谁负责把返回值转换成 JSON 或视图，最后再补上异常处理、拦截器回调和响应提交时机。像 Filter：Servlet 规范，作用在请求进入 Spring MVC 之前，适合编码、跨域、简单鉴权 这种主线，只要讲成“流经哪些节点、每个节点负责什么”，内容就会很顺。

这类题里真正容易混的，是几个相邻环节职责很像但边界不同。参数解析不是消息转换，过滤器不等于拦截器，视图解析和 @ResponseBody 也不在一条分支上。只要边界说模糊，后面一旦被追问 415、406、参数丢失、拦截器不执行、异常没接住，就很容易乱。像 不要把三者都说成“拦截请求” 这种提醒，核心就是要把“它在哪一层发生”讲准。

继续深挖时，通常会问“静态资源会经过 Interceptor 吗”和“preHandle 返回 false 会怎样”。这里最有说服力的证据不是概念，而是链路观测：会看访问日志、Spring MVC debug 日志、HandlerMapping 匹配结果、拦截器执行顺序、参数绑定异常、消息转换器选择结果、异常解析器是否接住、最终 HTTP 状态码和响应体。Web 层题的排查习惯，本质上就是沿请求方向一站一站往下排。

如果放回业务现场，这些点会长成很具体的问题。比如 @RequestBody 对不上 Content-Type 时会报 415，返回对象没找到可用 converter 时会报 406，拦截器路径没配对时权限逻辑会失效，统一异常处理没命中时前端会拿到默认错误页，参数解析器写得太激进时会把原有方法签名全打乱。把故障现象说出来，读者对整个 MVC 链就会有手感。

这一层也有取舍。Spring MVC 帮你把大部分 Web 细节抽掉了，但抽象越多，定位问题就越依赖你能不能把链路拆开。像 不要把三者都说成“拦截请求” 这种坑背后，其实是在提醒：别把“都在 Web 层发生”当成“它们是一回事”。只有职责边界清楚，出了问题才能知道先看容器入口、MVC 调度、控制器参数，还是响应输出。

最后收口时，把 Filter、Interceptor、AOP 有什么区别 讲成“请求从哪里进、在哪分叉、出了错卡在哪、拿什么证据确认”的闭环就够了。这样答案既有流程，也有排障抓手，面试官会更容易判断你是真走过请求链，而不是只背过 Controller 注解。

## 图解提示

适合画一张 Spring MVC 请求链图：请求进入容器 -> Filter -> DispatcherServlet -> HandlerMapping/HandlerAdapter -> Controller -> 返回值处理或异常处理 -> 响应返回。图里单独圈出 Filter：Servlet 规范，作用在请求进入 Spring MVC 之前，适合编码、跨域、简单鉴权、Interceptor：Spring MVC 机制，作用在 Handler 执行前后，能拿到 Handler 信息，适合登录校验、权限、日志 和 不要把三者都说成“拦截请求”，这样最容易讲清楚每一层到底负责什么。

## 记忆钩子

**Filter 看大门，Interceptor 看 Controller，AOP 看方法。**
