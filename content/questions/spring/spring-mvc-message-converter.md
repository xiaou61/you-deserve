---
title: HttpMessageConverter 有什么作用？
slug: spring-mvc-message-converter
category: Spring
tags:
  - Spring MVC
  - JSON
  - 消息转换器
difficulty: medium
route: Java 后端上岸路线
scene: 进阶追问
order: 4280
summary: HttpMessageConverter 负责请求体和响应体与 Java 对象之间的转换。
---
## 一句话结论

@RequestBody 和 @ResponseBody 背后依赖消息转换器，例如把 JSON 转成对象，或把对象写成 JSON。

## 通俗解释

消息转换器像翻译，把网络里的 JSON 文本翻成 Java 对象，再把 Java 对象翻回响应。

## 面试回答

可以从这几层回答：

- 读取请求时，根据 Content-Type 选择能读的转换器。
- 写响应时，根据 Accept 和返回值类型选择能写的转换器。
- 常见实现包括 MappingJackson2HttpMessageConverter。
- 配置不当会导致 415、406 或 JSON 序列化异常。

## 常见追问

### 415 和 406 分别代表什么？

415 是请求媒体类型服务端不支持，406 是客户端要求的响应类型服务端无法提供。

### @RequestBody 和 converter 什么关系？

@RequestBody 参数解析器会调用 HttpMessageConverter，把请求体转换成 Java 对象。

### 怎么自定义 JSON 序列化规则？

通常配置 ObjectMapper、Jackson 模块、序列化注解或消息转换器，而不是在 Controller 手写转换。

### 消息转换器会影响 @RequestParam 吗？

通常不会。@RequestParam 多走参数绑定和类型转换，Body JSON 才主要依赖消息转换器。

## 易错点

- 把参数绑定和消息转换混在一起。
- 忽略 Content-Type 和 Accept 对转换器选择的影响。

## 详细讲解

HttpMessageConverter 有什么作用 这类题不该答成“注解识别题”，而应该答成“请求链路题”。先用一句话压住重点，比如 HttpMessageConverter 负责请求体和响应体与 Java 对象之间的转换，然后把读者带回一次真实请求：从 Servlet 容器收进来，经过 Spring MVC 调度、参数解析、方法调用、返回值处理，再把响应吐出去。只要请求链画得出来，很多小问题就会自己找到位置。

最稳的讲法是沿着 DispatcherServlet 往下走。先看请求如何匹配到 Handler，再看谁负责调用方法、谁负责把请求参数转换成 Java 对象、谁负责把返回值转换成 JSON 或视图，最后再补上异常处理、拦截器回调和响应提交时机。像 读取请求时，根据 Content-Type 选择能读的转换器 这种主线，只要讲成“流经哪些节点、每个节点负责什么”，内容就会很顺。

这类题里真正容易混的，是几个相邻环节职责很像但边界不同。参数解析不是消息转换，过滤器不等于拦截器，视图解析和 @ResponseBody 也不在一条分支上。只要边界说模糊，后面一旦被追问 415、406、参数丢失、拦截器不执行、异常没接住，就很容易乱。像 把参数绑定和消息转换混在一起 这种提醒，核心就是要把“它在哪一层发生”讲准。

继续深挖时，通常会问“415 和 406 分别代表什么”和“@RequestBody 和 converter 什么关系”。这里最有说服力的证据不是概念，而是链路观测：会看访问日志、Spring MVC debug 日志、HandlerMapping 匹配结果、拦截器执行顺序、参数绑定异常、消息转换器选择结果、异常解析器是否接住、最终 HTTP 状态码和响应体。Web 层题的排查习惯，本质上就是沿请求方向一站一站往下排。

如果放回业务现场，这些点会长成很具体的问题。比如 @RequestBody 对不上 Content-Type 时会报 415，返回对象没找到可用 converter 时会报 406，拦截器路径没配对时权限逻辑会失效，统一异常处理没命中时前端会拿到默认错误页，参数解析器写得太激进时会把原有方法签名全打乱。把故障现象说出来，读者对整个 MVC 链就会有手感。

这一层也有取舍。Spring MVC 帮你把大部分 Web 细节抽掉了，但抽象越多，定位问题就越依赖你能不能把链路拆开。像 把参数绑定和消息转换混在一起 这种坑背后，其实是在提醒：别把“都在 Web 层发生”当成“它们是一回事”。只有职责边界清楚，出了问题才能知道先看容器入口、MVC 调度、控制器参数，还是响应输出。

最后收口时，把 HttpMessageConverter 有什么作用 讲成“请求从哪里进、在哪分叉、出了错卡在哪、拿什么证据确认”的闭环就够了。这样答案既有流程，也有排障抓手，面试官会更容易判断你是真走过请求链，而不是只背过 Controller 注解。

## 图解提示

适合画一张 Spring MVC 请求链图：请求进入容器 -> Filter -> DispatcherServlet -> HandlerMapping/HandlerAdapter -> Controller -> 返回值处理或异常处理 -> 响应返回。图里单独圈出 读取请求时，根据 Content-Type 选择能读的转换器、写响应时，根据 Accept 和返回值类型选择能写的转换器 和 把参数绑定和消息转换混在一起，这样最容易讲清楚每一层到底负责什么。

## 记忆钩子

**消息转换器管 Body：Content-Type 决定怎么读，Accept 影响怎么写。**
