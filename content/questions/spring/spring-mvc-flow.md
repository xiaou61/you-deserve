---
title: Spring MVC 一次请求的执行流程是什么？
slug: spring-mvc-flow
category: Spring
tags:
  - Java
  - Spring MVC
  - DispatcherServlet
  - Web
difficulty: medium
route: Java 后端上岸路线
scene: 一面/二面高频
order: 250
summary: 围绕 DispatcherServlet、HandlerMapping、HandlerAdapter 和 Controller 串起请求链路。
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

### HandlerMapping 和 HandlerAdapter 区别是什么？

HandlerMapping 负责找谁处理请求，HandlerAdapter 负责以合适方式调用这个处理器。

### REST 返回和页面返回在哪里分叉？

返回值处理阶段分叉：ResponseBody 走消息转换器写响应，视图名走 ViewResolver。

### 全局异常处理在哪个阶段生效？

异常抛出后由 HandlerExceptionResolver 链处理，@ControllerAdvice 属于其中常见方式。

### Interceptor 三个回调怎么对应流程？

preHandle 在 Controller 前，postHandle 在正常返回后，afterCompletion 在请求完成后清理。

## 易错点

- 不要只说 Controller 处理请求，要把 DispatcherServlet 讲出来。
- 不要把 Filter 和 Interceptor 混为一谈。
- 前后端分离项目重点说 JSON 转换，不要一直讲传统视图解析。

## 详细讲解

Spring MVC 一次请求的执行流程是什么 这类题不该答成“注解识别题”，而应该答成“请求链路题”。先用一句话压住重点，比如 围绕 DispatcherServlet、HandlerMapping、HandlerAdapter 和 Controller 串起请求链路，然后把读者带回一次真实请求：从 Servlet 容器收进来，经过 Spring MVC 调度、参数解析、方法调用、返回值处理，再把响应吐出去。只要请求链画得出来，很多小问题就会自己找到位置。

最稳的讲法是沿着 DispatcherServlet 往下走。先看请求如何匹配到 Handler，再看谁负责调用方法、谁负责把请求参数转换成 Java 对象、谁负责把返回值转换成 JSON 或视图，最后再补上异常处理、拦截器回调和响应提交时机。像 请求进入 `DispatcherServlet` 这种主线，只要讲成“流经哪些节点、每个节点负责什么”，内容就会很顺。

这类题里真正容易混的，是几个相邻环节职责很像但边界不同。参数解析不是消息转换，过滤器不等于拦截器，视图解析和 @ResponseBody 也不在一条分支上。只要边界说模糊，后面一旦被追问 415、406、参数丢失、拦截器不执行、异常没接住，就很容易乱。像 不要只说 Controller 处理请求，要把 DispatcherServlet 讲出来 这种提醒，核心就是要把“它在哪一层发生”讲准。

继续深挖时，通常会问“HandlerMapping 和 HandlerAdapter 区别是什么”和“REST 返回和页面返回在哪里分叉”。这里最有说服力的证据不是概念，而是链路观测：会看访问日志、Spring MVC debug 日志、HandlerMapping 匹配结果、拦截器执行顺序、参数绑定异常、消息转换器选择结果、异常解析器是否接住、最终 HTTP 状态码和响应体。Web 层题的排查习惯，本质上就是沿请求方向一站一站往下排。

如果放回业务现场，这些点会长成很具体的问题。比如 @RequestBody 对不上 Content-Type 时会报 415，返回对象没找到可用 converter 时会报 406，拦截器路径没配对时权限逻辑会失效，统一异常处理没命中时前端会拿到默认错误页，参数解析器写得太激进时会把原有方法签名全打乱。把故障现象说出来，读者对整个 MVC 链就会有手感。

这一层也有取舍。Spring MVC 帮你把大部分 Web 细节抽掉了，但抽象越多，定位问题就越依赖你能不能把链路拆开。像 不要只说 Controller 处理请求，要把 DispatcherServlet 讲出来 这种坑背后，其实是在提醒：别把“都在 Web 层发生”当成“它们是一回事”。只有职责边界清楚，出了问题才能知道先看容器入口、MVC 调度、控制器参数，还是响应输出。

最后收口时，把 Spring MVC 一次请求的执行流程是什么 讲成“请求从哪里进、在哪分叉、出了错卡在哪、拿什么证据确认”的闭环就够了。这样答案既有流程，也有排障抓手，面试官会更容易判断你是真走过请求链，而不是只背过 Controller 注解。

## 图解提示

适合画一张 Spring MVC 请求链图：请求进入容器 -> Filter -> DispatcherServlet -> HandlerMapping/HandlerAdapter -> Controller -> 返回值处理或异常处理 -> 响应返回。图里单独圈出 请求进入 `DispatcherServlet`、通过 `HandlerMapping` 找到匹配的 Handler，也就是 Controller 方法 和 不要只说 Controller 处理请求，要把 DispatcherServlet 讲出来，这样最容易讲清楚每一层到底负责什么。

## 记忆钩子

**DispatcherServlet 是总调度：找人、叫人、收结果、回响应。**
