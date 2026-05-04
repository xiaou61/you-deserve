# 题目质检 Batch 37：Redis 排行榜与 Spring 基础 361-370

审查时间：2026-05-04  
范围：按文件路径排序后的第 361-370 道题，`content/questions/redis/zset-ranking.md` 至 `content/questions/spring/factorybean.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批从 Redis ZSet 排行榜切到 Spring 基础，覆盖依赖注入、Bean 作用域、容器差异、BeanPostProcessor、循环依赖、条件装配、配置优先级、Controller/RestController 和 FactoryBean。Spring 入门题的短答案多数准确，`autowired-resource.md`、`bean-scope.md`、`circular-dependency.md` 质量较好；但容器扩展点、条件装配、配置优先级和 FactoryBean 仍被通用模板削弱，需要补 Spring 生命周期位置和源码级术语。

- 7 篇命中通用详解模板：`zset-ranking.md`、`beanfactory-applicationcontext.md`、`beanpostprocessor.md`、`conditional-annotation.md`、`configuration-priority.md`、`controller-restcontroller.md`、`factorybean.md`。
- 本批未发现重复 `## 图解提示`，但多个 visual 节点被截断或同质化，例如 `BeanPostProc...`、`@Conditional...`、`application...`。
- Spring 题要补“发生在容器生命周期哪一步、由哪个接口/注解触发、失效边界是什么”，否则容易只停在背概念。
- Redis ZSet 排行榜题方向正确，但还需要补并列排名、分数精度、分页和大榜单治理。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/redis/zset-ranking.md` | 方向正确，排行榜工程细节不足 | P1 | ZADD、ZREVRANGE、ZRANK、ZINCRBY 这些命令方向正确，但正文模板化。建议补并列分数如何排序、分页稳定性、冷热榜拆分、按周期滚动 key、延迟写入、分数精度、榜单过大裁剪和用户自身排名查询。 |
| 2 | `content/questions/spring/autowired-resource.md` | 正文质量较好 | P2 | `@Autowired` 按类型、`@Resource` 按名称优先、候选歧义和工程习惯讲得清楚。建议补 `@Qualifier`、构造器注入、`required=false`、`jakarta.annotation.Resource` 包变化，以及为什么不推荐字段注入。 |
| 3 | `content/questions/spring/bean-scope.md` | 正文质量较好 | P2 | singleton、prototype、request/session/application 和生命周期差异讲得较好。建议补 websocket scope、prototype 销毁不由容器完整托管、单例注入原型的失效点和 scoped proxy。 |
| 4 | `content/questions/spring/beanfactory-applicationcontext.md` | 方向正确，容器启动差异不足 | P1 | 国际化、事件、资源加载、自动装配方向正确，但正文模板化。建议补 BeanFactory 懒加载倾向、ApplicationContext 启动时预实例化单例、Environment、BeanPostProcessor 注册、WebApplicationContext 和实际开发为什么几乎总用 ApplicationContext。 |
| 5 | `content/questions/spring/beanpostprocessor.md` | 方向正确，生命周期位置不足 | P1 | 初始化前后扩展点方向正确，但节点出现 `- 初始化后` 这类拼接痕迹。建议补 `postProcessBeforeInitialization`、`postProcessAfterInitialization`、AOP 代理生成、`InstantiationAwareBeanPostProcessor`、执行顺序和不要在这里做重 IO。 |
| 6 | `content/questions/spring/circular-dependency.md` | 正文质量较好 | P2 | 实例化先行、三级缓存、代理处理、构造器循环依赖限制讲得比较完整。建议补 Spring Boot 默认是否允许循环依赖、`allowCircularReferences`、早期代理暴露、AOP 代理一致性和为什么设计上应避免循环依赖。 |
| 7 | `content/questions/spring/conditional-annotation.md` | 方向正确，注解体系不足 | P1 | 条件装配方向正确，但多个 visual 节点都被截断成 `@Conditional...`。建议补 `Condition` 接口、`ConditionContext`、`AnnotatedTypeMetadata`、`@ConditionalOnClass`、`@ConditionalOnMissingBean`、`@ConditionalOnProperty` 和自动配置中的使用位置。 |
| 8 | `content/questions/spring/configuration-priority.md` | 方向正确，精确优先级不足 | P1 | profile、环境变量、JVM 参数、命令行、配置中心方向正确。建议补 Spring Boot 外部化配置加载顺序、同名 key 覆盖、profile 激活、ConfigData、环境变量命名转换、配置中心刷新和排查 `/actuator/env`。 |
| 9 | `content/questions/spring/controller-restcontroller.md` | 核心正确，内容偏薄 | P2 | `@RestController = @Controller + @ResponseBody` 的核心正确。建议补视图解析、JSON 序列化、`@Controller` 返回页面与接口混用场景、`ResponseEntity`、统一异常处理和前后端分离下的常见选择。 |
| 10 | `content/questions/spring/factorybean.md` | 方向正确，FactoryBean 边界不足 | P1 | FactoryBean 创建复杂对象方向正确，但正文模板化。建议补 `getObject()`、`getObjectType()`、`isSingleton()`、`&beanName` 获取工厂本身、与 BeanFactory 区别、MyBatis Mapper/ProxyFactoryBean 典型场景和生命周期边界。 |

## 优先修复建议

1. Spring 基础题统一补生命周期位置，尤其是 BeanPostProcessor、FactoryBean、循环依赖和条件装配。
2. 条件装配与自动配置题应联动修，统一使用 Spring Boot 3 的自动配置文件和条件注解表达。
3. 配置优先级题需要补可验证工具：`/actuator/env`、启动日志、ConfigData、环境变量转换规则。
4. Redis ZSet 排行榜要补并列排名和分页稳定性，这是实际项目最常被追问的点。
5. 修 visual 节点截断，避免 `@Conditional...`、`application...` 这类节点让图解失去信息量。
