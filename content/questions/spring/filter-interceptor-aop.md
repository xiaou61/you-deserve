---
title: "Filter、Interceptor、AOP 有什么区别？"
slug: "filter-interceptor-aop"
category: "Spring"
tags: ["Spring", "Filter", "Interceptor", "AOP"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/项目高频"
order: 1120
summary: "从所属体系、执行位置和适用场景区分过滤器、拦截器和切面。"
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

Filter、Interceptor、AOP 的核心区别不是“都能拦截”，而是拦截发生的位置不同。Filter 属于 Servlet 规范，运行在 Web 容器层，请求进入 DispatcherServlet 之前就可能经过 Filter；Interceptor 属于 Spring MVC，只有请求被映射到 Handler 后才进入拦截器链；AOP 属于 Spring Bean 方法增强，关注的是对象方法调用，而不是 HTTP 请求本身。

Filter 更靠近网络入口，适合处理编码、CORS、粗粒度鉴权、日志 traceId、请求包装和安全过滤。它能覆盖静态资源、非 MVC 请求和进入 Spring 前的流量，但拿不到完整的 HandlerMethod 语义。Interceptor 更靠近 MVC 调度，能拿到 handler，适合登录态检查、接口权限、租户上下文、请求耗时和业务级审计。它有 preHandle、postHandle、afterCompletion 三个回调，可以表达放行、响应后处理和最终清理。

AOP 更适合横切业务方法，例如事务、方法级权限、幂等注解、审计日志、限流注解和埋点。它依赖 Spring 代理，只有经过代理对象的方法调用才会增强，自调用、private/final 方法、非 Spring Bean 都可能不生效。回答时要主动说明：AOP 不关心 URL 是否命中，它关心的是哪个 Bean 的哪个方法被代理调用。

选择时可以按边界判断：需要在请求进入 Spring 前处理，用 Filter；需要基于 Handler、路径、用户上下文处理，用 Interceptor；需要基于业务方法、注解、事务语义处理，用 AOP。异常链路也不同：Filter 要在 finally 里清理上下文，Interceptor 的 afterCompletion 在 Handler 执行完成后更适合收尾，AOP 则通过 around/afterThrowing 观察方法异常。

面试图解适合画成请求从浏览器进入服务的纵向链路：Web 容器先执行 Filter，DispatcherServlet 找 Handler 后执行 Interceptor，Controller 调 Service 时进入 AOP 代理。这样回答比简单背“Filter 依赖 Servlet、Interceptor 依赖 Spring、AOP 依赖代理”更能体现工程边界。

如果把这道题讲成项目经历，可以从“Filter 层、Servlet 容器、Interceptor 层”切入，先交代触发条件、请求或容器阶段，再展开关键机制。接着用“Controller 前后、AOP 代理层、按边界选择”说明处理动作、验证指标和失败兜底。这样面试官继续追问时，你可以沿着一条真实链路回答：请求从哪里进入，Spring 容器或代理对象做了什么，哪个上下文会变化，失败时怎样限制影响面。

图解时不要只画名词列表，要把状态变化画出来：哪些节点代表入口，哪些节点代表容器扩展点，哪些节点代表代理、事务或线程上下文，哪些节点代表验证闭环。回答最后再补一句取舍：Spring 方案通常是在开发效率、扩展性、运行时代理边界和排障复杂度之间做平衡，不能只说“加注解”或“改配置”，必须说明生效时机、失效条件、灰度策略、告警阈值和回滚方式。

落到线上时，还要主动补监控证据：启动日志、Bean 创建顺序、ConditionEvaluationReport、Actuator 端点、请求链路、线程池指标、事务日志、异常栈、接口 P95/P99 和安全审计等信号。能把这些信号讲出来，答案才从“知道 Spring 注解”升级为“能维护 Spring 应用”。如果面试官继续追问，还可以补一次故障演练：如何模拟代理失效、如何观察上下文、如何灰度恢复、如何持续复盘防止同类问题再次发生和扩大。

## 深挖理解

这道题不要只停在“是什么”。面试官真正想确认的是：你能不能把 Filter、Interceptor、AOP 有什么区别 放回真实系统里，讲清楚它为什么出现、解决什么问题、代价是什么。可以先用一句话定调：Filter 属于 Servlet 规范，最靠近 Web 容器；Interceptor 属于 Spring MVC，围绕 Controller 请求；AOP 属于 Spring 代理机制，围绕方法增强

拆开来看，第一层是背景问题：从所属体系、执行位置和适用场景区分过滤器、拦截器和切面。 如果只背结论，很容易在追问里断掉；更稳的方式是先说明问题发生的场景，再解释机制为什么能缓解这个问题。

第二层是核心机制：Filter：Servlet 规范，作用在请求进入 Spring MVC 之前，适合编码、跨域、简单鉴权。 这里要尽量把动作讲成链路，而不是罗列名词。比如谁先发生、谁依赖谁、哪个状态会改变、失败时会留下什么痕迹。

第三层是边界和取舍：Interceptor：Spring MVC 机制，作用在 Handler 执行前后，能拿到 Handler 信息，适合登录校验、权限、日志。 它通常不是银弹，真正的面试加分点是能主动说出适用范围、性能影响、复杂度和替代方案。

最后落到风险意识：AOP：Spring 代理增强，作用在 Bean 方法调用上，适合事务、日志、监控等横切逻辑。 不要只背概念名词，要能说出触发条件、底层机制和排查入口。这样回答会比单纯背八股更像做过项目的人。

## 实战落地

- **什么时候会遇到**：当业务代码出现 Spring、Filter、Interceptor、AOP 相关的并发异常、性能抖动、配置不生效、对象行为和预期不一致时，就可以用这道题定位原因。
- **怎么做方案**：先看触发条件，再看运行时机制。围绕“调用入口、对象状态、线程边界、框架代理、异常日志”五个位置检查，判断 Filter、Interceptor、AOP 有什么区别 是设计问题、用法问题还是环境问题。
- **怎么验证效果**：用单元测试、压测、日志、线程栈、JFR/GC 日志或本地最小复现确认。结合真实业务代码说明什么时候会踩坑、怎么定位、怎么替换方案。
- **怎么兜底**：准备替代 API、隔离开关、降级策略、配置回滚和监控告警。面试里能讲出兜底，说明你不是只会写 happy path。

## 追问准备

- **如果数据量或并发量扩大 10 倍怎么办？** 先回答瓶颈会出现在哪里，再说扩容、分片、缓存、异步化或限流策略，最后补一句监控指标怎么验证。
- **如果它失败了会有什么表现？** 从用户现象、服务日志、核心指标、数据状态四个角度描述。能说出失败表现，就能自然过渡到排查方案。
- **和相近方案怎么选？** 不要直接说“看场景”，要给出判断维度：一致性要求、延迟要求、吞吐量、实现复杂度、团队维护成本和故障恢复成本。
- **你在项目里会怎么讲？** 用“背景 -> 方案 -> 取舍 -> 验证 -> 复盘”的顺序，把 Filter、Interceptor、AOP 有什么区别 讲成一次工程决策，而不是一个孤立知识点。重点围绕 对象模型、运行时行为、边界条件和框架默认行为。

## 回答模板

面试时可以按这个节奏组织：

1. **先给结论**：从所属体系、执行位置和适用场景区分过滤器、拦截器和切面。
2. **再讲机制**：它的核心不是某个名词，而是一组处理链路。把关键角色、状态变化和触发条件说清楚。
3. **补充边界**：说明什么情况下有效，什么情况下会失效，以及为什么需要配套措施。
4. **落到项目**：如果我在项目里遇到，会先看指标和日志定位问题，再用灰度、压测和回滚策略验证方案。
5. **收一句风险**：真正重要的是不要只让功能跑通，还要保证高并发、异常分支和数据状态都可控。

## 图解提示

适合画一张对比图：Filter 层 -> Servlet 容器 -> Interceptor 层 -> Controller 前后 -> AOP 代理层 -> 按边界选择。画面重点突出：Filter 在 Servlet 容器层，Interceptor 在 Spring MVC Handler 链路，AOP 在 Spring Bean 方法调用边界。

## 记忆钩子

**Filter 看大门，Interceptor 看 Controller，AOP 看方法。**
