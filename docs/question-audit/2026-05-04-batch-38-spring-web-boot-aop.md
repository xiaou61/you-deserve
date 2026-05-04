# 题目质检 Batch 38：Spring Web、Boot 与 AOP 371-380

审查时间：2026-05-04  
范围：按文件路径排序后的第 371-380 道题，`content/questions/spring/filter-interceptor-aop.md` 至 `content/questions/spring/spring-boot-startup-flow.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 Filter/Interceptor/AOP、执行顺序、Actuator、Spring AOP、事务事件、`@Async`、Bean 生命周期、自动配置、自定义 Starter 和启动流程。`filter-interceptor-aop.md`、`spring-aop.md`、`spring-bean-lifecycle.md`、`spring-boot-autoconfiguration.md` 的主线较好；事务事件、自定义 Starter、启动流程、`@Async` 这些工程题仍需补版本差异、代理边界、线程池和启动阶段。

- 7 篇命中通用详解模板：`interceptor-filter-order.md`、`spring-actuator.md`、`spring-application-event-transaction.md`、`spring-async.md`、`spring-boot-starter-custom.md`、`spring-boot-startup-flow.md` 等。
- 3 篇存在重复 `## 图解提示`：`spring-application-event-transaction.md`、`spring-boot-starter-custom.md`、`spring-boot-startup-flow.md`。
- 图解节点截断集中在 `ApplicationE...`、`@Transaction...`、`autoconfi...`、`SpringApplic...`，影响读者理解。
- Boot 题需要统一到 Spring Boot 3 语境：`AutoConfiguration.imports`、条件装配、Actuator 暴露和安全控制。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/spring/filter-interceptor-aop.md` | 正文质量较好 | P2 | 三者作用位置、典型用途和选择原则清楚。建议补 Filter 在 Servlet 容器层、Interceptor 在 HandlerMapping/Adapter 之后、AOP 在 Spring Bean 方法调用上，以及异常链路和静态资源是否经过。 |
| 2 | `content/questions/spring/interceptor-filter-order.md` | 方向正确，链路细节不足 | P1 | Filter 链、DispatcherServlet、Interceptor、Controller、postHandle 方向正确。建议补 `preHandle` 返回 false、`afterCompletion` 触发条件、多个 Filter/Interceptor 顺序配置、异常情况下调用顺序和 AOP 切入位置。 |
| 3 | `content/questions/spring/spring-actuator.md` | 方向正确，安全与指标不足 | P1 | 健康检查、指标、配置、应用信息方向正确，但正文模板化。建议补 endpoint 暴露控制、`management.endpoints.web.exposure.include`、health group、Micrometer、Prometheus、敏感端点保护和生产禁用 env/beans 暴露。 |
| 4 | `content/questions/spring/spring-aop.md` | 正文质量较好 | P2 | 横切关注点、切点、通知、代理对象、适用场景和失效边界讲得较好。建议补 JDK 动态代理与 CGLIB、final/private 方法、自调用失效、代理对象获取和事务/AOP 顺序。 |
| 5 | `content/questions/spring/spring-application-event-transaction.md` | 方向正确，事务阶段不足 | P1 | 事务内发 MQ、短信、清缓存要等提交后，这个方向正确，但重复 `## 图解提示`。建议补 `@TransactionalEventListener` 的 `BEFORE_COMMIT`、`AFTER_COMMIT`、`AFTER_ROLLBACK`、`AFTER_COMPLETION`，以及异步事件线程池、异常处理和 Outbox 替代方案。 |
| 6 | `content/questions/spring/spring-async.md` | 方向正确，线程池与异常不足 | P1 | 启用 `@EnableAsync`、代理调用、避免内部自调用、配置线程池方向正确。建议补返回 `Future/CompletableFuture`、void 异常处理器、事务上下文不自动传播、MDC/安全上下文传递、线程池拒绝策略和监控。 |
| 7 | `content/questions/spring/spring-bean-lifecycle.md` | 正文质量较好 | P2 | 实例化、属性填充、Aware、初始化前后处理、初始化方法和销毁步骤清楚。建议补 SmartInitializingSingleton、ApplicationRunner/CommandLineRunner 和 BeanPostProcessor 在 AOP 代理中的位置。 |
| 8 | `content/questions/spring/spring-boot-autoconfiguration.md` | 正文质量较好 | P2 | starter、自动配置类、条件注解、默认 Bean 和覆盖调试主线清楚。建议补 Spring Boot 3 的 `AutoConfiguration.imports`、旧版 `spring.factories` 差异、`ConditionEvaluationReport` 和 `--debug`。 |
| 9 | `content/questions/spring/spring-boot-starter-custom.md` | 方向正确，Boot 3 细节不足 | P1 | 拆分 autoconfigure、条件注解、默认值、元数据方向正确，但重复 `## 图解提示`。建议补 starter 与 autoconfigure 包拆分、`@AutoConfiguration`、`AutoConfiguration.imports`、`@ConfigurationProperties`、metadata、条件注解和版本兼容测试。 |
| 10 | `content/questions/spring/spring-boot-startup-flow.md` | 方向正确，启动阶段不足 | P1 | SpringApplication、ApplicationContext、自动配置、Bean 创建、内嵌 Web 容器方向正确，但重复 `## 图解提示`。建议补 run listeners、environment 准备、banner、context refresh、BeanFactoryPostProcessor、BeanPostProcessor、Tomcat 启动和 Runner 执行顺序。 |

## 优先修复建议

1. 先修 3 篇重复 `## 图解提示`，事务事件、Starter、启动流程都适合画时序图。
2. Boot 相关题统一补 Spring Boot 3 自动配置机制，避免旧 `spring.factories` 说法一刀切。
3. `@Async`、事务事件、AOP 要统一强调代理调用边界和线程/事务上下文不会自动传播。
4. Actuator 题必须补生产安全边界，避免只说“能看健康检查和指标”。
5. 执行链路题建议画一张请求进入 Filter、DispatcherServlet、Interceptor、Controller、AOP 的顺序图。
