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

## 详细讲解

Spring MVC 一次请求的执行流程，可以围绕 DispatcherServlet 这个前端控制器展开。HTTP 请求先到 Servlet 容器，比如 Tomcat。容器根据映射把请求交给 DispatcherServlet。DispatcherServlet 不直接写业务，而是负责调度整条 MVC 链路：找处理器、适配调用、处理参数、执行 Controller、处理返回值、渲染视图或写 JSON。

第一步是 HandlerMapping。它根据请求路径、HTTP 方法、请求头等信息，找到对应的 Handler，也就是你写的 Controller 方法以及拦截器链。RequestMappingHandlerMapping 是最常见的实现，它会在启动时扫描 RequestMapping、GetMapping、PostMapping 等注解，建立路径到方法的映射关系。如果路径匹配不到，就可能返回 404。

第二步是 HandlerAdapter。为什么找到 Handler 后还需要 Adapter？因为不同类型的处理器调用方式可能不同，适配器负责用统一方式调用它们。现在常见的是 RequestMappingHandlerAdapter，它会处理 Controller 方法参数，比如 PathVariable、RequestParam、RequestBody、ModelAttribute，还会触发类型转换、消息转换、数据绑定和校验。

调用 Controller 前后，拦截器会参与。preHandle 在 Controller 前执行，可以做登录校验、权限判断、TraceId 注入；postHandle 在 Controller 返回后、视图渲染前执行；afterCompletion 在整个请求完成后执行，适合清理资源和记录日志。要注意 Filter、Interceptor、AOP 的层次不同：Filter 在 Servlet 层更靠前，Interceptor 在 Spring MVC 层，AOP 则围绕 Bean 方法。

Controller 执行后，返回值会交给返回值处理器。返回页面时可能走 ViewResolver 找视图；返回 JSON 时，ResponseBody 或 RestController 会让 HttpMessageConverter 把对象序列化成 JSON 写入响应。请求体 JSON 反序列化也是消息转换器完成的，比如 MappingJackson2HttpMessageConverter。

图解建议画成请求流水线：客户端 -> Tomcat -> Filter -> DispatcherServlet -> HandlerMapping -> Interceptor preHandle -> HandlerAdapter -> 参数解析和消息转换 -> Controller -> 返回值处理 -> Interceptor afterCompletion -> 响应。回答时补一句排查思路：404 看映射，400 看参数绑定和校验，415/406 看消息转换器和 Content-Type，500 看 Controller、Service 或异常处理器。

## 深挖理解

这道题不要只停在“是什么”。面试官真正想确认的是：你能不能把 Spring MVC 一次请求的执行流程是什么 放回真实系统里，讲清楚它为什么出现、解决什么问题、代价是什么。可以先用一句话定调：Spring MVC 的核心入口是 DispatcherServlet，它负责接收请求、查找处理器、调用 Controller、处理返回结果，最后生成响应

拆开来看，第一层是背景问题：围绕 DispatcherServlet、HandlerMapping、HandlerAdapter 和 Controller 串起请求链路。 如果只背结论，很容易在追问里断掉；更稳的方式是先说明问题发生的场景，再解释机制为什么能缓解这个问题。

第二层是核心机制：请求进入 DispatcherServlet。 这里要尽量把动作讲成链路，而不是罗列名词。比如谁先发生、谁依赖谁、哪个状态会改变、失败时会留下什么痕迹。

第三层是边界和取舍：通过 HandlerMapping 找到匹配的 Handler，也就是 Controller 方法。 它通常不是银弹，真正的面试加分点是能主动说出适用范围、性能影响、复杂度和替代方案。

最后落到风险意识：通过 HandlerAdapter 调用具体方法。 不要只背概念名词，要能说出触发条件、底层机制和排查入口。这样回答会比单纯背八股更像做过项目的人。

## 实战落地

- **什么时候会遇到**：当业务代码出现 Java、Spring MVC、DispatcherServlet、Web 相关的并发异常、性能抖动、配置不生效、对象行为和预期不一致时，就可以用这道题定位原因。
- **怎么做方案**：先看触发条件，再看运行时机制。围绕“调用入口、对象状态、线程边界、框架代理、异常日志”五个位置检查，判断 Spring MVC 一次请求的执行流程是什么 是设计问题、用法问题还是环境问题。
- **怎么验证效果**：用单元测试、压测、日志、线程栈、JFR/GC 日志或本地最小复现确认。结合真实业务代码说明什么时候会踩坑、怎么定位、怎么替换方案。
- **怎么兜底**：准备替代 API、隔离开关、降级策略、配置回滚和监控告警。面试里能讲出兜底，说明你不是只会写 happy path。

## 追问准备

- **如果数据量或并发量扩大 10 倍怎么办？** 先回答瓶颈会出现在哪里，再说扩容、分片、缓存、异步化或限流策略，最后补一句监控指标怎么验证。
- **如果它失败了会有什么表现？** 从用户现象、服务日志、核心指标、数据状态四个角度描述。能说出失败表现，就能自然过渡到排查方案。
- **和相近方案怎么选？** 不要直接说“看场景”，要给出判断维度：一致性要求、延迟要求、吞吐量、实现复杂度、团队维护成本和故障恢复成本。
- **你在项目里会怎么讲？** 用“背景 -> 方案 -> 取舍 -> 验证 -> 复盘”的顺序，把 Spring MVC 一次请求的执行流程是什么 讲成一次工程决策，而不是一个孤立知识点。重点围绕 对象模型、运行时行为、边界条件和框架默认行为。

## 回答模板

面试时可以按这个节奏组织：

1. **先给结论**：围绕 DispatcherServlet、HandlerMapping、HandlerAdapter 和 Controller 串起请求链路。
2. **再讲机制**：它的核心不是某个名词，而是一组处理链路。把关键角色、状态变化和触发条件说清楚。
3. **补充边界**：说明什么情况下有效，什么情况下会失效，以及为什么需要配套措施。
4. **落到项目**：如果我在项目里遇到，会先看指标和日志定位问题，再用灰度、压测和回滚策略验证方案。
5. **收一句风险**：真正重要的是不要只让功能跑通，还要保证高并发、异常分支和数据状态都可控。

## 图解提示

适合画一张流程图：Spring MVC 一次请求的执行流程是什么。核心节点：请求进入 DispatcherSer… -> 通过 HandlerMapping… -> 通过 HandlerAdapter… -> 方法执行前后可能经过拦截器 -> Controller 返回数据或视图。画面重点突出“问题从哪里来、机制如何工作、风险在哪里、怎么落到实践”。补充一句背景：围绕 DispatcherServlet、HandlerMapping、HandlerAdapter 和 Controller 串起请求链路。。

## 记忆钩子

**DispatcherServlet 是总调度：找人、叫人、收结果、回响应。**
