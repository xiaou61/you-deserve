---
title: "@Controller 和 @RestController 有什么区别？"
slug: "controller-restcontroller"
category: "Spring"
tags: ["Spring MVC", "Controller", "RestController", "接口"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面基础"
order: 1500
summary: "@RestController 等价于 @Controller 加 @ResponseBody，默认返回 JSON 等响应体。"
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

`@Controller` 是 Spring MVC 的控制器注解，通常用于返回页面或视图。方法返回字符串时，如果没有 `@ResponseBody`，Spring MVC 可能把它当作视图名交给视图解析器。`@RestController` 可以理解为 `@Controller` 加 `@ResponseBody`，类中方法默认把返回值写入 HTTP 响应体，常用于 REST API。

返回 JSON 的关键不是注解本身，而是 HttpMessageConverter。`@ResponseBody` 或 `@RestController` 返回对象时，Spring 会根据 Content-Type、Accept 和已注册转换器，把对象序列化成 JSON、XML 或其他格式。配置不当时可能出现 406、415、序列化字段异常或日期格式不一致。

实际项目里，前后端分离接口通常用 `@RestController`，页面渲染或模板项目用 `@Controller`。如果同一个类既返回页面又返回 JSON，要小心注解位置，避免把视图名当成普通字符串响应。接口返回还常配合 `ResponseEntity` 控制状态码、header 和 body，异常则通过全局异常处理统一格式。

面试回答可以一句话定调：区别在返回值处理方式，`@Controller` 默认走视图解析，`@RestController` 默认走响应体写出。然后补消息转换器、视图解析、ResponseEntity 和统一异常处理，就比只说“RestController 返回 JSON”更完整。

如果把这道题讲成项目经历，可以从“@Controller、视图解析、@ResponseBody”切入，先交代触发条件、请求或容器阶段，再展开关键机制。接着用“@RestController、消息转换器、接口实践”说明处理动作、验证指标和失败兜底。这样面试官继续追问时，你可以沿着一条真实链路回答：请求从哪里进入，Spring 容器或代理对象做了什么，哪个上下文会变化，失败时怎样限制影响面。

图解时不要只画名词列表，要把状态变化画出来：哪些节点代表入口，哪些节点代表容器扩展点，哪些节点代表代理、事务或线程上下文，哪些节点代表验证闭环。回答最后再补一句取舍：Spring 方案通常是在开发效率、扩展性、运行时代理边界和排障复杂度之间做平衡，不能只说“加注解”或“改配置”，必须说明生效时机、失效条件、灰度策略、告警阈值和回滚方式。

落到线上时，还要主动补监控证据：启动日志、Bean 创建顺序、ConditionEvaluationReport、Actuator 端点、请求链路、线程池指标、事务日志、异常栈、接口 P95/P99 和安全审计等信号。能把这些信号讲出来，答案才从“知道 Spring 注解”升级为“能维护 Spring 应用”。如果面试官继续追问，还可以补一次故障演练：如何模拟代理失效、如何观察上下文、如何灰度恢复、如何持续复盘防止同类问题再次发生和扩大。

## 深挖理解

这道题不要只停在“是什么”。面试官真正想确认的是：你能不能把 @Controller 和 @RestController 有什么区别 放回真实系统里，讲清楚它为什么出现、解决什么问题、代价是什么。可以先用一句话定调：@RestController 可以理解为 @Controller 加 @ResponseBody，适合写前后端分离接口；@Controller 更常用于返回页面视图

拆开来看，第一层是背景问题：@RestController 等价于 @Controller 加 @ResponseBody，默认返回 JSON 等响应体。 如果只背结论，很容易在追问里断掉；更稳的方式是先说明问题发生的场景，再解释机制为什么能缓解这个问题。

第二层是核心机制：@Controller 是 Spring MVC 控制器注解，方法返回值默认可能被解析成视图名 这里要尽量把动作讲成链路，而不是罗列名词。比如谁先发生、谁依赖谁、哪个状态会改变、失败时会留下什么痕迹。

第三层是边界和取舍：如果要返回 JSON，需要在方法上加 @ResponseBody 它通常不是银弹，真正的面试加分点是能主动说出适用范围、性能影响、复杂度和替代方案。

最后落到风险意识：@RestController 是组合注解，包含 @Controller 和 @ResponseBody，类中方法默认把返回值写入 HTTP 响应体，常用于 REST API 不要只背概念名词，要能说出触发条件、底层机制和排查入口。这样回答会比单纯背八股更像做过项目的人。

## 实战落地

- **什么时候会遇到**：当业务代码出现 Spring MVC、Controller、RestController、接口 相关的并发异常、性能抖动、配置不生效、对象行为和预期不一致时，就可以用这道题定位原因。
- **怎么做方案**：先看触发条件，再看运行时机制。围绕“调用入口、对象状态、线程边界、框架代理、异常日志”五个位置检查，判断 @Controller 和 @RestController 有什么区别 是设计问题、用法问题还是环境问题。
- **怎么验证效果**：用单元测试、压测、日志、线程栈、JFR/GC 日志或本地最小复现确认。结合真实业务代码说明什么时候会踩坑、怎么定位、怎么替换方案。
- **怎么兜底**：准备替代 API、隔离开关、降级策略、配置回滚和监控告警。面试里能讲出兜底，说明你不是只会写 happy path。

## 追问准备

- **如果数据量或并发量扩大 10 倍怎么办？** 先回答瓶颈会出现在哪里，再说扩容、分片、缓存、异步化或限流策略，最后补一句监控指标怎么验证。
- **如果它失败了会有什么表现？** 从用户现象、服务日志、核心指标、数据状态四个角度描述。能说出失败表现，就能自然过渡到排查方案。
- **和相近方案怎么选？** 不要直接说“看场景”，要给出判断维度：一致性要求、延迟要求、吞吐量、实现复杂度、团队维护成本和故障恢复成本。
- **你在项目里会怎么讲？** 用“背景 -> 方案 -> 取舍 -> 验证 -> 复盘”的顺序，把 @Controller 和 @RestController 有什么区别 讲成一次工程决策，而不是一个孤立知识点。重点围绕 对象模型、运行时行为、边界条件和框架默认行为。

## 回答模板

面试时可以按这个节奏组织：

1. **先给结论**：@RestController 等价于 @Controller 加 @ResponseBody，默认返回 JSON 等响应体。
2. **再讲机制**：它的核心不是某个名词，而是一组处理链路。把关键角色、状态变化和触发条件说清楚。
3. **补充边界**：说明什么情况下有效，什么情况下会失效，以及为什么需要配套措施。
4. **落到项目**：如果我在项目里遇到，会先看指标和日志定位问题，再用灰度、压测和回滚策略验证方案。
5. **收一句风险**：真正重要的是不要只让功能跑通，还要保证高并发、异常分支和数据状态都可控。

## 图解提示

适合画一张对比图：@Controller -> 视图解析 -> @ResponseBody -> @RestController -> 消息转换器 -> 接口实践。画面重点突出：@Controller 常用于页面和视图，@RestController 等价于 @Controller 加 @ResponseBody，默认返回响应体。

## 记忆钩子

**Controller 找页面，RestController 给数据。**
