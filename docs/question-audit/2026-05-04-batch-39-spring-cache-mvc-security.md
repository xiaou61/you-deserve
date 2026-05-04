# 题目质检 Batch 39：Spring Cache、MVC 扩展与 Security 381-390

审查时间：2026-05-04  
范围：按文件路径排序后的第 381-390 道题，`content/questions/spring/spring-cache-annotation.md` 至 `content/questions/spring/spring-security-basic.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 Spring Cache、配置绑定、事件机制、`@Import`、MVC 参数解析器、MVC 流程、消息转换器、Profile、定时任务和 Spring Security 基础。`spring-mvc-flow.md` 和 `spring-security-basic.md` 的主线较完整；Cache、ConfigurationProperties、Import、ArgumentResolver、MessageConverter、Scheduled 的题目都方向正确，但缺源码入口、异常状态码、顺序和生产坑位。

- 8 篇命中通用详解模板，只有 `spring-mvc-flow.md`、`spring-security-basic.md` 不明显模板化。
- 6 篇存在重复 `## 图解提示`：`spring-cache-annotation.md`、`spring-configuration-properties.md`、`spring-import-selector.md`、`spring-mvc-argument-resolver.md`、`spring-mvc-message-converter.md`、`spring-scheduled-pitfalls.md`。
- 图解节点截断集中在注解名和类名：`@CacheEvict...`、`DispatcherSe...`、`@RequestPara...`、`Mappi...`。
- MVC 扩展点要补“由哪个组件调用、顺序如何、异常如何落到 400/415/406”，Security 题要补过滤器链和上下文保存。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/spring/spring-cache-annotation.md` | 方向正确，一致性和 key 设计不足 | P1 | `@Cacheable`、`@CachePut`、`@CacheEvict` 方向正确，但重复 `## 图解提示`。建议补 key 生成、`condition/unless`、`sync=true`、事务提交后清缓存、缓存穿透、过期时间由缓存实现控制、批量失效和 Redis/Caffeine 差异。 |
| 2 | `content/questions/spring/spring-configuration-properties.md` | 方向正确，绑定细节不足 | P1 | prefix 绑定、适合第三方配置、启动期校验方向正确，但重复 `## 图解提示`。建议补 relaxed binding、嵌套对象、集合绑定、`@Validated`、构造器绑定、配置元数据、与 `@Value` 的维护性差异和刷新边界。 |
| 3 | `content/questions/spring/spring-event.md` | 方向正确，事件边界不足 | P1 | Spring 事件用于解耦同步/异步监听方向正确，但正文模板化。建议补 `ApplicationEventPublisher`、`@EventListener`、同步默认行为、异步执行、异常传播、事务事件区别和不适合做强可靠消息。 |
| 4 | `content/questions/spring/spring-import-selector.md` | 方向正确，Import 三种路径不足 | P1 | 普通配置类、ImportSelector、ImportBeanDefinitionRegistrar 方向正确，但重复 `## 图解提示`。建议补 `DeferredImportSelector`、Enable 模式、自动配置导入、BeanDefinition 注册、选择器返回类名和与条件注解的配合。 |
| 5 | `content/questions/spring/spring-mvc-argument-resolver.md` | 方向正确，调用链不足 | P1 | DispatcherServlet、`@RequestParam`、自定义解析器、参数绑定异常方向正确，但重复 `## 图解提示`。建议补 `HandlerMethodArgumentResolver`、`supportsParameter`、`resolveArgument`、注册顺序、`WebDataBinder`、`ConversionService` 和鉴权用户注入场景。 |
| 6 | `content/questions/spring/spring-mvc-flow.md` | 正文质量较好 | P2 | 请求进入、DispatcherServlet、HandlerMapping、HandlerAdapter、参数和返回值处理、响应返回讲得较完整。建议补异常解析器、拦截器三个回调、视图解析与 REST 返回的差异。 |
| 7 | `content/questions/spring/spring-mvc-message-converter.md` | 方向正确，内容协商不足 | P1 | 读请求、写响应、常见 JSON converter、415/406 方向正确，但重复 `## 图解提示`。建议补 `HttpMessageConverter` 选择依据、`Content-Type`、`Accept`、`@RequestBody`/`@ResponseBody`、自定义 converter 和序列化安全。 |
| 8 | `content/questions/spring/spring-profiles.md` | 方向正确，激活和覆盖不足 | P2 | Profile 区分环境方向正确，但正文模板化。建议补 `spring.profiles.active`、`spring.config.activate.on-profile`、多 profile 合并、默认 profile、环境变量激活和配置覆盖顺序。 |
| 9 | `content/questions/spring/spring-scheduled-pitfalls.md` | 方向正确，分布式与线程池不足 | P1 | 默认线程少、多实例重复执行、异常记录、分布式调度方向正确，但重复 `## 图解提示`。建议补 `fixedRate/fixedDelay/cron` 区别、线程池配置、任务重入、超时、分布式锁、补偿执行、时区和观测告警。 |
| 10 | `content/questions/spring/spring-security-basic.md` | 正文质量较好 | P2 | 认证、凭证校验、SecurityContext、授权、权限规则和拒绝/放行讲得清楚。建议补过滤器链、AuthenticationManager、Provider、PasswordEncoder、SecurityContextRepository、方法级授权和 401/403 区别。 |

## 优先修复建议

1. 先修 6 篇重复 `## 图解提示`，MVC 扩展点适合画 DispatcherServlet 后半段的处理链。
2. Cache 题要和 Redis 缓存题联动，补 key、TTL、一致性、事务提交后失效和缓存穿透。
3. MVC 参数解析器、消息转换器、异常处理、拦截器应统一一张请求执行链，减少重复解释。
4. Scheduled 题要纳入项目调度题，补多实例、幂等、补偿和告警。
5. Spring Security 基础题建议补过滤器链，让认证/授权不只是抽象名词。
