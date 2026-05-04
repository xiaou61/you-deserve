# 题目质检 Batch 40：Spring Security、事务与 WebFlux 391-400

审查时间：2026-05-04  
范围：按文件路径排序后的第 391-400 道题，`content/questions/spring/spring-security-jwt.md` 至 `content/questions/spring/webflux-vs-mvc.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

最后一批覆盖 Spring Security JWT、事务失效、参数校验、WebClient、Starter、事务隔离、传播、readOnly、回滚规则和 MVC/WebFlux 对比。`spring-transaction-failure.md`、`starter.md`、`transaction-propagation.md` 的主体较好；JWT、Validation、WebClient、事务隔离/readOnly/rollback、WebFlux 这些题方向正确，但如果不补过滤器链、数据库隔离映射、响应式线程模型和异常边界，面试深挖时仍显单薄。

- 7 篇命中通用详解模板：`spring-security-jwt.md`、`spring-validation.md`、`spring-webclient.md`、`transaction-isolation.md`、`transaction-readonly.md`、`transaction-rollback-rules.md`、`webflux-vs-mvc.md`。
- 1 篇存在重复 `## 图解提示`：`spring-webclient.md`。
- 图解节点截断集中在 JWT、WebClient、事务隔离级别等长标签，如 `Spring Secur...`、`READ_COMMITT...`、`REPEATABLE_R...`。
- 至此第四轮按文件路径排序的 400 道题已全部完成审计记录，后续可以进入“按 P1 优先级修正文 + visual”的阶段。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/spring/spring-security-jwt.md` | 方向正确，安全链路不足 | P1 | 用户名密码登录、生成 JWT、后续请求携带 token、自定义过滤器解析方向正确，但正文模板化。建议补 `PasswordEncoder`、AuthenticationManager、过滤器插入位置、无状态 Session、refresh token、注销黑名单、密钥轮换、过期时间和 401/403。 |
| 2 | `content/questions/spring/spring-transaction-failure.md` | 正文质量较好 | P2 | 代理调用、异常判断、传播行为、数据库支持和排查闭环讲得较好。建议补同类内部调用、自定义异常、捕获异常不抛、`rollbackFor`、非 public 方法、事务管理器选错和 `@Transactional` 放在接口/类上的差异。 |
| 3 | `content/questions/spring/spring-validation.md` | 方向正确，分组和嵌套不足 | P1 | DTO 字段注解、Controller 参数 `@Valid`、全局异常处理方向正确。建议补 `@Validated` 分组、嵌套对象 `@Valid`、集合校验、方法级校验、`BindingResult`、自定义 Constraint、国际化消息和 400 响应格式。 |
| 4 | `content/questions/spring/spring-webclient.md` | 方向正确，响应式边界不足 | P1 | RestTemplate 阻塞、WebClient 基于响应式、连接池超时重试方向正确，但重复 `## 图解提示`。建议补 Reactor Netty、事件循环线程、`retrieve/exchangeToMono`、timeout/retry/backoff、连接池、阻塞调用隔离、上下文传递和日志脱敏。 |
| 5 | `content/questions/spring/starter.md` | 正文质量较好 | P2 | starter 依赖打包、自动配置入口、开箱即用、约定组合和自定义 starter 主线清楚。建议补 starter 本身通常不直接写大量配置逻辑，而是依赖 autoconfigure；再补 Boot 3 自动配置注册文件。 |
| 6 | `content/questions/spring/transaction-isolation.md` | 方向正确，数据库映射不足 | P1 | DEFAULT、READ_UNCOMMITTED、READ_COMMITTED、REPEATABLE_READ、SERIALIZABLE 列举正确。建议补隔离级别最终由数据库实现、MySQL InnoDB 默认 RR、MVCC/Next-Key Lock、Spring `Isolation.DEFAULT` 含义和隔离级别升高的性能代价。 |
| 7 | `content/questions/spring/transaction-propagation.md` | 正文质量较好 | P2 | REQUIRED、REQUIRES_NEW、NESTED、SUPPORTS 和传播本质讲得清楚。建议补 `MANDATORY/NOT_SUPPORTED/NEVER`、REQUIRES_NEW 挂起外部事务、NESTED 依赖 savepoint、异常传播导致外层回滚的常见坑。 |
| 8 | `content/questions/spring/transaction-readonly.md` | 方向正确，readOnly 误区不足 | P1 | 表达语义、ORM 减少脏检查、连接池/读写分离利用 readOnly 方向正确。建议强调 readOnly 不是强制禁止写，取决于数据库、驱动和事务管理器；补 Hibernate flush mode、MySQL `START TRANSACTION READ ONLY`、误路由到只读库和监控。 |
| 9 | `content/questions/spring/transaction-rollback-rules.md` | 方向正确，异常边界不足 | P1 | 默认运行时异常回滚方向正确，但正文模板化。建议补 checked exception 不默认回滚、`rollbackFor/noRollbackFor`、异常被 catch 后不回滚、`setRollbackOnly`、内部调用失效和异步线程异常不影响原事务。 |
| 10 | `content/questions/spring/webflux-vs-mvc.md` | 方向正确，响应式模型不足 | P1 | 编程模型、底层模型、适用场景、学习成本方向正确。建议补 Servlet thread-per-request 与 Netty event loop、Reactive Streams 背压、阻塞调用危害、数据库驱动是否响应式、上下文传递、调试成本和 MVC 项目引入 WebClient 的边界。 |

## 优先修复建议

1. 先修 `spring-webclient.md` 的重复 `## 图解提示`，并把 WebClient/WebFlux 的响应式概念统一。
2. Spring Security JWT 与 Security 基础题联动，补过滤器链、Authentication、SecurityContext、无状态会话和 token 生命周期。
3. 事务四题统一修：失效、隔离、传播、readOnly、回滚规则要互相引用且不矛盾。
4. Validation 题需要补 `@Valid`、`@Validated`、分组、嵌套、方法级校验和全局异常格式。
5. 第四轮审计完成后，下一阶段建议按 P1 批量修正文和 visual，再运行 lint/build 做页面验证。
