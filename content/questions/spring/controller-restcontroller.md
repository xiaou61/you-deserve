---
title: '@Controller 和 @RestController 有什么区别？'
slug: controller-restcontroller
category: Spring
tags:
  - Spring MVC
  - Controller
  - RestController
  - 接口
difficulty: easy
route: Java 后端上岸路线
scene: 一面基础
order: 1500
summary: '@RestController 等价于 @Controller 加 @ResponseBody，默认返回 JSON 等响应体。'
---
## 一句话结论

`@RestController` 可以理解为 `@Controller` 加 `@ResponseBody`，适合写前后端分离接口；`@Controller` 更常用于返回页面视图。

## 通俗解释

`@Controller` 像带你去某个页面，`@RestController` 像直接把数据打包给你。

## 面试回答

`@Controller` 是 Spring MVC 控制器注解，方法返回值默认可能被解析成视图名。如果要返回 JSON，需要在方法上加 `@ResponseBody`。

`@RestController` 是组合注解，包含 `@Controller` 和 `@ResponseBody`，类中方法默认把返回值写入 HTTP 响应体，常用于 REST API。

现在前后端分离项目里，大多数接口控制器会使用 `@RestController`。

## 常见追问

### @RestController 一定返回 JSON 吗？

不一定。它返回响应体，具体格式由 HttpMessageConverter 和内容协商决定，常见是 JSON。

### @Controller 返回字符串会怎样？

默认可能被当作视图名解析；加 `@ResponseBody` 才会作为响应体字符串返回。

### 什么时候用 ResponseEntity？

需要显式控制 HTTP 状态码、Header、缓存策略或响应体时使用。

### 前后端分离为什么常用 @RestController？

因为接口通常直接返回 JSON 数据，不需要服务端视图解析。

## 易错点

- 不要说二者没有区别。
- 不要把 `@RestController` 用在需要跳转页面的控制器上。
- JSON 转换依赖消息转换器，不是注解自己手写 JSON。

## 详细讲解

@Controller 和 @RestController 有什么区别 这类题不该答成“注解识别题”，而应该答成“请求链路题”。先用一句话压住重点，比如 @RestController 等价于 @Controller 加 @ResponseBody，默认返回 JSON 等响应体，然后把读者带回一次真实请求：从 Servlet 容器收进来，经过 Spring MVC 调度、参数解析、方法调用、返回值处理，再把响应吐出去。只要请求链画得出来，很多小问题就会自己找到位置。

最稳的讲法是沿着 DispatcherServlet 往下走。先看请求如何匹配到 Handler，再看谁负责调用方法、谁负责把请求参数转换成 Java 对象、谁负责把返回值转换成 JSON 或视图，最后再补上异常处理、拦截器回调和响应提交时机。像 请求如何一步步落到 Controller 这种主线，只要讲成“流经哪些节点、每个节点负责什么”，内容就会很顺。

这类题里真正容易混的，是几个相邻环节职责很像但边界不同。参数解析不是消息转换，过滤器不等于拦截器，视图解析和 @ResponseBody 也不在一条分支上。只要边界说模糊，后面一旦被追问 415、406、参数丢失、拦截器不执行、异常没接住，就很容易乱。像 不要说二者没有区别 这种提醒，核心就是要把“它在哪一层发生”讲准。

继续深挖时，通常会问“@RestController 一定返回 JSON 吗”和“@Controller 返回字符串会怎样”。这里最有说服力的证据不是概念，而是链路观测：会看访问日志、Spring MVC debug 日志、HandlerMapping 匹配结果、拦截器执行顺序、参数绑定异常、消息转换器选择结果、异常解析器是否接住、最终 HTTP 状态码和响应体。Web 层题的排查习惯，本质上就是沿请求方向一站一站往下排。

如果放回业务现场，这些点会长成很具体的问题。比如 @RequestBody 对不上 Content-Type 时会报 415，返回对象没找到可用 converter 时会报 406，拦截器路径没配对时权限逻辑会失效，统一异常处理没命中时前端会拿到默认错误页，参数解析器写得太激进时会把原有方法签名全打乱。把故障现象说出来，读者对整个 MVC 链就会有手感。

这一层也有取舍。Spring MVC 帮你把大部分 Web 细节抽掉了，但抽象越多，定位问题就越依赖你能不能把链路拆开。像 不要说二者没有区别 这种坑背后，其实是在提醒：别把“都在 Web 层发生”当成“它们是一回事”。只有职责边界清楚，出了问题才能知道先看容器入口、MVC 调度、控制器参数，还是响应输出。

最后收口时，把 @Controller 和 @RestController 有什么区别 讲成“请求从哪里进、在哪分叉、出了错卡在哪、拿什么证据确认”的闭环就够了。这样答案既有流程，也有排障抓手，面试官会更容易判断你是真走过请求链，而不是只背过 Controller 注解。

## 图解提示

适合画一张 Spring MVC 请求链图：请求进入容器 -> Filter -> DispatcherServlet -> HandlerMapping/HandlerAdapter -> Controller -> 返回值处理或异常处理 -> 响应返回。图里单独圈出 入口阶段、关键分叉点 和 不要说二者没有区别，这样最容易讲清楚每一层到底负责什么。

## 记忆钩子

**Controller 找页面，RestController 给数据。**
