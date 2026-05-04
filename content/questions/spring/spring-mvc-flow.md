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

Spring MVC 一次请求的主线从 DispatcherServlet 开始。请求先经过 Filter 链，然后进入 DispatcherServlet。DispatcherServlet 通过 HandlerMapping 查找能处理当前请求的 Handler，返回 HandlerExecutionChain，其中包含 Controller 方法和匹配的 Interceptor。

接着执行 Interceptor 的 preHandle。全部放行后，DispatcherServlet 选择合适的 HandlerAdapter 调用 Controller。对注解式 Controller 来说，HandlerAdapter 会准备方法参数：参数解析器处理 `@RequestParam`、`@PathVariable`、`@RequestBody` 等，消息转换器读取请求体，数据绑定和校验处理对象参数。

Controller 执行后，返回值处理器决定响应怎么写。如果是 `@ResponseBody` 或 `@RestController`，通常通过 HttpMessageConverter 写 JSON；如果返回视图名，则交给 ViewResolver 做视图解析。正常路径下 postHandle 会在 Controller 返回后执行，afterCompletion 在请求完成后执行。

异常路径也要讲。Controller、参数绑定、消息转换、业务逻辑都可能抛异常，Spring MVC 会交给 HandlerExceptionResolver 链处理，例如 `@ExceptionHandler`、`@ControllerAdvice`、ResponseStatusExceptionResolver 等。异常被处理后，仍要确保 afterCompletion 和 Filter finally 完成上下文清理。

回答可以画成一条调度链：Filter -> DispatcherServlet -> HandlerMapping -> Interceptor -> HandlerAdapter -> 参数解析 -> Controller -> 返回值处理 -> 异常解析 -> 响应。这样能自然引出参数解析器、消息转换器、拦截器、异常处理和视图解析，面试官追问哪个点都能接得住。

如果把这道题讲成项目经历，可以从“请求进入、查找 Handler、执行拦截器”切入，先交代触发条件、请求或容器阶段，再展开关键机制。接着用“调用 Adapter、处理返回值、异常和完成”说明处理动作、验证指标和失败兜底。这样面试官继续追问时，你可以沿着一条真实链路回答：请求从哪里进入，Spring 容器或代理对象做了什么，哪个上下文会变化，失败时怎样限制影响面。

图解时不要只画名词列表，要把状态变化画出来：哪些节点代表入口，哪些节点代表容器扩展点，哪些节点代表代理、事务或线程上下文，哪些节点代表验证闭环。回答最后再补一句取舍：Spring 方案通常是在开发效率、扩展性、运行时代理边界和排障复杂度之间做平衡，不能只说“加注解”或“改配置”，必须说明生效时机、失效条件、灰度策略、告警阈值和回滚方式。

落到线上时，还要主动补监控证据：启动日志、Bean 创建顺序、ConditionEvaluationReport、Actuator 端点、请求链路、线程池指标、事务日志、异常栈、接口 P95/P99 和安全审计等信号。能把这些信号讲出来，答案才从“知道 Spring 注解”升级为“能维护 Spring 应用”。如果面试官继续追问，还可以补一次故障演练：如何模拟代理失效、如何观察上下文、如何灰度恢复、如何持续复盘防止同类问题再次发生和扩大。

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

适合画一张时序图：请求进入 -> 查找 Handler -> 执行拦截器 -> 调用 Adapter -> 处理返回值 -> 异常和完成。画面重点突出：一次 MVC 请求经过 DispatcherServlet、HandlerMapping、Interceptor、HandlerAdapter、参数解析、返回值处理和异常解析。

## 记忆钩子

**DispatcherServlet 是总调度：找人、叫人、收结果、回响应。**
