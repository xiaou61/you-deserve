---
title: "多个 Filter 和 Interceptor 的执行顺序怎么理解？"
slug: "filter-interceptor-order"
category: "Spring"
tags: ["Spring", "Filter", "Interceptor", "执行顺序"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目追问"
order: 2410
summary: "Filter 发生在 Servlet 容器层，Interceptor 发生在 Spring MVC 层，多个组件按注册顺序和配置顺序形成调用链。"
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

多个 Filter 和 Interceptor 的顺序可以用“洋葱模型”理解。请求进入应用时，先经过 Servlet Filter 链，Filter1 前置逻辑执行后调用 chain.doFilter，进入 Filter2，再继续进入 DispatcherServlet。Controller 执行完返回时，会从内到外依次回到 Filter2 后置逻辑、Filter1 后置逻辑。所以 Filter 的前置按顺序进入，后置按反向退出。

Interceptor 的位置在 DispatcherServlet 之内。DispatcherServlet 通过 HandlerMapping 找到 HandlerExecutionChain 后，会按注册顺序执行多个 Interceptor 的 preHandle。只有所有 preHandle 都返回 true，Controller 才会执行。Controller 正常返回 ModelAndView 后，postHandle 按反向顺序执行；请求完成后，afterCompletion 也按反向顺序执行，用来释放 ThreadLocal、记录耗时和清理上下文。

异常和短路是这道题的追问重点。如果某个 preHandle 返回 false，后续 Interceptor 和 Controller 不会执行，已经成功执行过 preHandle 的 Interceptor 可能进入 afterCompletion 收尾。Controller 抛异常时，postHandle 通常不会按正常路径执行，但 afterCompletion 仍然是重要的清理入口。Filter 如果要保证上下文清理，必须用 try/finally 包住 chain.doFilter。

顺序配置也要分层看。Filter 可通过 FilterRegistrationBean、@Order 或容器注册顺序控制；Interceptor 通过 WebMvcConfigurer.addInterceptors 的注册顺序控制，也可以配 includePathPatterns 和 excludePathPatterns。AOP 发生在 Controller 或 Service 方法调用边界，若 Controller 方法本身被代理，才会出现在方法执行附近；多数业务 Service AOP 则发生在 Controller 调用 Service 之后。

面试回答可以先画顺序，再补短路和异常。完整链路是：Filter 前置 -> DispatcherServlet -> Interceptor preHandle -> Controller -> Interceptor postHandle -> 视图或响应处理 -> Interceptor afterCompletion -> Filter 后置。能把 false、异常、finally、ThreadLocal 清理讲出来，说明你不是只背调用顺序。

如果把这道题讲成项目经历，可以从“进入 Filter1、进入 Filter2、DispatcherServlet”切入，先交代触发条件、请求或容器阶段，再展开关键机制。接着用“preHandle、Controller 执行、返回和清理”说明处理动作、验证指标和失败兜底。这样面试官继续追问时，你可以沿着一条真实链路回答：请求从哪里进入，Spring 容器或代理对象做了什么，哪个上下文会变化，失败时怎样限制影响面。

图解时不要只画名词列表，要把状态变化画出来：哪些节点代表入口，哪些节点代表容器扩展点，哪些节点代表代理、事务或线程上下文，哪些节点代表验证闭环。回答最后再补一句取舍：Spring 方案通常是在开发效率、扩展性、运行时代理边界和排障复杂度之间做平衡，不能只说“加注解”或“改配置”，必须说明生效时机、失效条件、灰度策略、告警阈值和回滚方式。

落到线上时，还要主动补监控证据：启动日志、Bean 创建顺序、ConditionEvaluationReport、Actuator 端点、请求链路、线程池指标、事务日志、异常栈、接口 P95/P99 和安全审计等信号。能把这些信号讲出来，答案才从“知道 Spring 注解”升级为“能维护 Spring 应用”。如果面试官继续追问，还可以补一次故障演练：如何模拟代理失效、如何观察上下文、如何灰度恢复、如何持续复盘防止同类问题再次发生和扩大。

## 深挖理解

这道题不要只停在“是什么”。面试官真正想确认的是：你能不能把 多个 Filter 和 Interceptor 的执行顺序怎么理解 放回真实系统里，讲清楚它为什么出现、解决什么问题、代价是什么。可以先用一句话定调：Filter 在 Servlet 容器层先执行，Interceptor 在 Spring MVC 分发到 Controller 前后执行；多个组件会按注册或配置顺序形成链式调用

拆开来看，第一层是背景问题：Filter 发生在 Servlet 容器层，Interceptor 发生在 Spring MVC 层，多个组件按注册顺序和配置顺序形成调用链。 如果只背结论，很容易在追问里断掉；更稳的方式是先说明问题发生的场景，再解释机制为什么能缓解这个问题。

第二层是核心机制：请求进入 Servlet 容器。 这里要尽量把动作讲成链路，而不是罗列名词。比如谁先发生、谁依赖谁、哪个状态会改变、失败时会留下什么痕迹。

第三层是边界和取舍：先经过 Filter 链。 它通常不是银弹，真正的面试加分点是能主动说出适用范围、性能影响、复杂度和替代方案。

最后落到风险意识：到达 DispatcherServlet。 不要只背概念名词，要能说出触发条件、底层机制和排查入口。这样回答会比单纯背八股更像做过项目的人。

## 实战落地

- **什么时候会遇到**：当业务代码出现 Spring、Filter、Interceptor、执行顺序 相关的并发异常、性能抖动、配置不生效、对象行为和预期不一致时，就可以用这道题定位原因。
- **怎么做方案**：先看触发条件，再看运行时机制。围绕“调用入口、对象状态、线程边界、框架代理、异常日志”五个位置检查，判断 多个 Filter 和 Interceptor 的执行顺序怎么理解 是设计问题、用法问题还是环境问题。
- **怎么验证效果**：用单元测试、压测、日志、线程栈、JFR/GC 日志或本地最小复现确认。结合真实业务代码说明什么时候会踩坑、怎么定位、怎么替换方案。
- **怎么兜底**：准备替代 API、隔离开关、降级策略、配置回滚和监控告警。面试里能讲出兜底，说明你不是只会写 happy path。

## 追问准备

- **如果数据量或并发量扩大 10 倍怎么办？** 先回答瓶颈会出现在哪里，再说扩容、分片、缓存、异步化或限流策略，最后补一句监控指标怎么验证。
- **如果它失败了会有什么表现？** 从用户现象、服务日志、核心指标、数据状态四个角度描述。能说出失败表现，就能自然过渡到排查方案。
- **和相近方案怎么选？** 不要直接说“看场景”，要给出判断维度：一致性要求、延迟要求、吞吐量、实现复杂度、团队维护成本和故障恢复成本。
- **你在项目里会怎么讲？** 用“背景 -> 方案 -> 取舍 -> 验证 -> 复盘”的顺序，把 多个 Filter 和 Interceptor 的执行顺序怎么理解 讲成一次工程决策，而不是一个孤立知识点。重点围绕 对象模型、运行时行为、边界条件和框架默认行为。

## 回答模板

面试时可以按这个节奏组织：

1. **先给结论**：Filter 发生在 Servlet 容器层，Interceptor 发生在 Spring MVC 层，多个组件按注册顺序和配置顺序形成调用链。
2. **再讲机制**：它的核心不是某个名词，而是一组处理链路。把关键角色、状态变化和触发条件说清楚。
3. **补充边界**：说明什么情况下有效，什么情况下会失效，以及为什么需要配套措施。
4. **落到项目**：如果我在项目里遇到，会先看指标和日志定位问题，再用灰度、压测和回滚策略验证方案。
5. **收一句风险**：真正重要的是不要只让功能跑通，还要保证高并发、异常分支和数据状态都可控。

## 图解提示

适合画一张时序图：进入 Filter1 -> 进入 Filter2 -> DispatcherServlet -> preHandle -> Controller 执行 -> 返回和清理。画面重点突出：请求先进入 Filter 链，再到 DispatcherServlet 和 Interceptor，返回时按相反方向收尾。

## 记忆钩子

**Filter 是小区门，Interceptor 是办公楼前台。**
