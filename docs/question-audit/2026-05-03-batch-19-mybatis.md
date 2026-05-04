# 题目质检 Batch 19：MyBatis 181-190

审查时间：2026-05-03  
范围：排序后的第 181-190 道题，`content/questions/mybatis/batch-insert.md` 至 `content/questions/mybatis/mybatis-sqlsession-thread-safe.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批进入 MyBatis 专题。`cache.md`、`hash-dollar.md`、`mapper-proxy.md` 的主体内容明显更扎实，能讲清关键机制；但自动扩写段仍然普遍套用“日志、单元测试、线程栈、JFR/GC、灰度压测回滚”这类 Java 通用模板，导致 MyBatis 专项证据链不够准。

- 10 篇都命中通用模板，尤其 `mybatis-dynamic-table-name.md`、`mybatis-executor-types.md`、`mybatis-second-cache-pitfalls.md`、`mybatis-sqlsession-thread-safe.md`。
- 4 篇存在重复 `## 图解提示`：`mybatis-dynamic-table-name.md`、`mybatis-executor-types.md`、`mybatis-second-cache-pitfalls.md`、`mybatis-sqlsession-thread-safe.md`。
- 多个图解节点截断：`batch e...`、`Mapper na...`、`Prepared...`、`flushS...`、`SqlS...`，影响关键术语展示。
- MyBatis 题需要补框架级边界：Spring 下 SqlSession 生命周期、一级缓存的事务/会话作用域、二级缓存跨 namespace 风险、ExecutorType.BATCH 的 `flushStatements` 和 JDBC driver 行为、`${}` 和动态表名的白名单治理。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mybatis/batch-insert.md` | 方向正确，批处理细节可补 | P2 | `foreach` 多 values、`ExecutorType.BATCH`、分批、事务、失败处理这些都正确。建议补两种方案差异：多 values 是一条大 SQL，BATCH 是多条语句攒批；MySQL 场景补 `rewriteBatchedStatements`、单 SQL 包大小/参数上限、生成主键回填、批量失败定位、`flushStatements` 和内存占用。图解节点有 `batch e...` 截断。 |
| 2 | `content/questions/mybatis/cache.md` | 正文较好，可做基准稿 | P2 | 一级缓存 SqlSession 作用域、默认开启、增删改/提交/回滚/关闭清空、二级缓存 namespace 作用域和慎用理由都讲得清楚。建议补 Spring 集成下 SqlSessionTemplate 会按事务/方法管理会话，一级缓存不等于跨请求缓存；补 `localCacheScope=SESSION/STATEMENT`、`flushCache/useCache`、二级缓存对象序列化和脏读边界。 |
| 3 | `content/questions/mybatis/dynamic-sql.md` | 基础完整，表达可更工程化 | P2 | `if`、`choose`、`where`、`set`、`foreach`、`trim` 和 `${}` 注入风险都讲到。建议补 OGNL 表达式、`bind`、`sql/include` 片段复用、`foreach` 空集合处理、动态 SQL 过度复杂时如何拆查询对象或改 Query Builder，并增加“打印 BoundSql/最终 SQL”作为排查入口。 |
| 4 | `content/questions/mybatis/hash-dollar.md` | 正文扎实，安全意识较好 | P2 | `#{}` 走 PreparedStatement 参数绑定，`${}` 是文本替换，动态表名/列名/排序字段必须白名单，这些都正确。建议补 `#{}` 只能绑定值不能绑定 SQL 标识符、TypeHandler 参与参数处理、预编译不等于所有 SQL 都能复用计划、`${}` 的白名单要做业务枚举映射而不是关键字过滤。 |
| 5 | `content/questions/mybatis/lazy-loading.md` | 方向正确，配置机制可补 | P2 | 延迟加载是在访问关联属性时再查，可能减少无用查询，也可能引发 N+1；序列化意外触发查询这个风险讲得对。建议补 `lazyLoadingEnabled`、`aggressiveLazyLoading`、`association/collection select`、代理对象触发时机、JSON 序列化和事务关闭后的访问问题，以及如何用 SQL 日志确认 N+1。 |
| 6 | `content/questions/mybatis/mapper-proxy.md` | 正文较好，底层类名可补 | P2 | 动态代理、namespace、mapped statement、SqlSession/Executor 执行链路讲得较完整。建议补 `MapperProxy`、`MapperMethod`、`MapperRegistry`、`MappedStatement`、参数名解析、接口方法重载风险和启动期校验；图解节点 `Map...` 截断。 |
| 7 | `content/questions/mybatis/mybatis-dynamic-table-name.md` | 安全方向正确，追问和图解需修 | P1 | 表名/列名不能用 `#{}` 作为值绑定，使用 `${}` 时必须白名单映射，这个核心正确。但重复 `图解提示`，常见追问仍是占位；安全题只讲“白名单”还不够。建议补分库分表路由函数、租户/年份/月表的枚举规则、ShardingSphere/MyBatis-Plus 动态表名插件边界、SQL 日志脱敏、只过滤关键字不安全、排序字段同样白名单。 |
| 8 | `content/questions/mybatis/mybatis-executor-types.md` | 基础正确，BATCH 细节不足 | P1 | SIMPLE、REUSE、BATCH 的大方向正确，但重复 `图解提示`，`Prepared...`、`flushS...` 节点截断，追问占位。建议补 SIMPLE 默认行为、REUSE 复用 Statement 的 key、BATCH 只对更新类语句收益明显、`flushStatements` 返回 `BatchResult`、事务提交时刷新、批量失败定位困难、与 Spring Batch/手动 SqlSession 的使用边界。 |
| 9 | `content/questions/mybatis/mybatis-second-cache-pitfalls.md` | 方向正确，与缓存题需去重 | P1 | namespace 级别、跨 namespace 关联不易感知、分布式多实例本地缓存不一致、实际更常用 Redis，这些正确。但重复 `图解提示`，追问占位，且与 `cache.md` 内容重叠较大。建议补 `cache-ref`、`flushCache/useCache`、多表 join 查询失效边界、对象可序列化要求、读写频繁场景的脏数据示例、为什么业务缓存要显式设计 key/TTL/失效策略。 |
| 10 | `content/questions/mybatis/mybatis-sqlsession-thread-safe.md` | 结论正确，Spring 语义可补 | P1 | SqlSession 非线程安全、Mapper 代理可复用、Spring 下由 SqlSessionTemplate 管理线程绑定资源、手动使用要 close，这些正确。但重复 `图解提示`，追问占位，图解节点 `SqlS...` 截断。建议补 SqlSession 内含 Executor、一级缓存、事务和连接上下文；SqlSessionTemplate 本身线程安全但代理到底层线程绑定 SqlSession；异步线程、手动缓存 SqlSession、跨线程传 Mapper 调用的风险。 |

## 优先修复建议

1. 先修 4 篇重复图解：`mybatis-dynamic-table-name.md`、`mybatis-executor-types.md`、`mybatis-second-cache-pitfalls.md`、`mybatis-sqlsession-thread-safe.md`，并补真实追问。
2. 安全相关题统一治理：`hash-dollar.md` 和 `mybatis-dynamic-table-name.md` 要形成闭环，明确“值用 `#{}`，标识符只能白名单后 `${}` 或插件路由生成”。
3. 缓存相关题拆分定位：`cache.md` 讲一级/二级缓存总览，`mybatis-second-cache-pitfalls.md` 专讲二级缓存坑点、跨 namespace、多实例和业务缓存替代。
4. 批量写入相关题联动：`batch-insert.md` 和 `mybatis-executor-types.md` 都要补 `ExecutorType.BATCH`、`flushStatements`、事务边界和 JDBC driver 行为，避免只停在“分批”。
5. 把本批的通用排查句替换为 MyBatis 专项证据：BoundSql、最终 SQL、参数绑定日志、MappedStatement id、SqlSession 生命周期、一级缓存命中、二级缓存命中/失效、执行器类型和批处理结果。
