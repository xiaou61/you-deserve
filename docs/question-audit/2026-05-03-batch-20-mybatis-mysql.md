# 题目质检 Batch 20：MyBatis + MySQL 191-200

审查时间：2026-05-03  
范围：排序后的第 191-200 道题，`content/questions/mybatis/mybatis-typehandler.md` 至 `content/questions/mysql/connection-pool.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批前半是 MyBatis 进阶机制，后半切到 MySQL 基础和工程治理。`n-plus-one.md`、`resultmap-resulttype.md`、`clustered-secondary-index.md` 的正文质量较好；MySQL 基础题整体没有明显方向性错误。但本批仍存在自动模板污染，尤其 MyBatis 插件/TypeHandler 与 MySQL 归档/连接池这些工程题，应该补更具体的框架类、配置项、指标和失败边界。

- 10 篇均命中通用模板，其中 MySQL 题统一套了 `explain、慢日志、锁等待、命中率、QPS、P99`，对 binlog、字段类型、连接池并不都精准。
- 3 篇存在重复 `## 图解提示`：`mybatis-typehandler.md`、`cold-hot-data-archive.md`、`connection-pool.md`。
- 关键图解节点仍有截断或过浅：`JDBC 值转换成...`、`Executor`、`StatementHandler`、`row_id`、`varchar` 等。
- 需要补专项证据链：MyBatis 看 BoundSql、拦截器签名、TypeHandler 注册和映射；MySQL 看 `mysqlbinlog`、`SHOW BINARY LOGS`、`EXPLAIN`、连接池 active/idle/pending、归档校验和主从延迟。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mybatis/mybatis-typehandler.md` | 方向正确，追问和图解需修 | P1 | TypeHandler 负责 Java 类型与 JDBC 类型互转，枚举、JSON、加密字段、自定义值对象这些用途正确。但重复 `图解提示`，常见追问占位，正文没有讲 `setNonNullParameter`、`getNullableResult`、`BaseTypeHandler`、全局注册/局部指定的优先级。建议补不要把业务校验塞进 TypeHandler，枚举值演进要兼容历史数据。 |
| 2 | `content/questions/mybatis/n-plus-one.md` | 正文扎实，可保留 | P2 | 先查主列表再循环查详情导致 1+N 次 SQL、常见于懒加载/循环 mapper、用 join 或批量 `in` 优化、通过 SQL 日志/APM 发现，这些讲得清楚。建议补分页场景下 join 结果集膨胀、`IN` 列表过长分批、按外键聚合组装、缓存字典数据、一次请求数据库调用次数作为监控指标。 |
| 3 | `content/questions/mybatis/pagination-plugin.md` | 方向正确，插件细节可补 | P2 | 分页插件拦截 Executor/StatementHandler、改写 SQL、追加 limit、额外执行 count，深分页和 count 慢的边界正确。建议补 PageHelper 常见 ThreadLocal 分页参数、方言识别、JSqlParser/SQL parser 改写复杂 SQL 的风险、count 优化开关、深分页改 seek/keyset pagination。 |
| 4 | `content/questions/mybatis/plugin-interceptor.md` | 基础正确，但机制表达偏浅 | P1 | 能列出 Executor、StatementHandler、ParameterHandler、ResultSetHandler，并知道用于分页、审计、SQL 改写。但 `详细讲解` 把核心机制写成“Executor。”、“StatementHandler。”这类孤立词，深度不足。建议补 `Interceptor`、`Invocation`、`Plugin.wrap`、`@Intercepts/@Signature`、拦截器链顺序、只拦截 MyBatis 开放方法、多个插件改写 SQL 的冲突和性能成本。 |
| 5 | `content/questions/mybatis/resultmap-resulttype.md` | 正文较好，可补边界 | P2 | resultType 自动映射简单结果，resultMap 处理字段不一致、嵌套对象、一对多和集合，判断标准清楚。建议补 `id/result/association/collection/discriminator`、`autoMapping`、驼峰映射、列别名、嵌套 resultMap 与嵌套 select 的差异、一对多去重依赖 id 标识。 |
| 6 | `content/questions/mysql/binlog-format.md` | 核心正确，复制细节可补 | P2 | statement、row、mixed 的区分正确，也能说明 row 更可靠但日志量更大，binlog 与 redo log 的层级区别正确。建议补 statement 的非确定函数、自增、触发器、主从环境差异风险；row 的 `binlog_row_image`、GTID、CDC 友好性；mixed 不是随意选择而是由 MySQL 判断安全性；排查可用 `SHOW VARIABLES LIKE 'binlog_format'` 和 `mysqlbinlog`。 |
| 7 | `content/questions/mysql/char-varchar.md` | 基础正确，存储细节可补 | P2 | char 定长、varchar 变长、手机号不要存数字、字符集影响字节这些正确。建议补 InnoDB 行格式下 varchar 的长度字节、最大行大小限制、char 尾部空格处理和比较语义、utf8mb4 下字符数/字节数差异、索引前缀长度、固定状态码不一定都要 char，也可以用 tinyint/枚举映射。 |
| 8 | `content/questions/mysql/clustered-secondary-index.md` | 正文较好，可继续细化 | P2 | InnoDB 聚簇索引叶子存整行，二级索引叶子存索引列和主键值，回表、主键长度影响所有二级索引，这些讲得扎实。建议补覆盖索引、索引下推与回表的关系、隐藏 row_id 对复制/页分裂的影响、主键顺序插入与页分裂、二级索引查询加锁时可能锁主键记录。 |
| 9 | `content/questions/mysql/cold-hot-data-archive.md` | 工程方向正确，闭环还可加深 | P1 | 按时间/状态/业务完成度划分，小批量低峰迁移、归档查询、避免漏/重、可回滚和监控，这些方向正确。但重复 `图解提示`，后半段仍套 MySQL 通用模板。建议补归档任务的幂等主键、校验源/目标行数和 checksum、先写归档再标记/删除、主从延迟和大事务控制、查询入口降级、权限审计、归档库索引和生命周期管理。 |
| 10 | `content/questions/mysql/connection-pool.md` | 主体正确，参数和指标可补 | P1 | 复用连接、控制最大连接数、健康检查、等待队列、超时机制、连接池不是越大越好都正确。但重复 `图解提示`，指标泛化。建议补 HikariCP 的 `maximumPoolSize`、`minimumIdle`、`connectionTimeout`、`idleTimeout`、`maxLifetime`、`leakDetectionThreshold`，总连接数 = 实例数 x 池大小，观察 active/idle/pending、获取连接耗时、数据库 `max_connections`、慢 SQL 与连接耗尽的因果。 |

## 优先修复建议

1. 先修 `mybatis-typehandler.md`、`cold-hot-data-archive.md`、`connection-pool.md` 的重复图解，并替换占位追问。
2. `plugin-interceptor.md` 要重点重写 `详细讲解/深挖理解`，不能只罗列四个拦截对象，要讲 `@Signature`、代理包装、调用链和插件顺序。
3. MyBatis 题统一补排查证据：BoundSql、MappedStatement id、SQL 参数、拦截器链、TypeHandler 注册来源、resultMap id 映射。
4. MySQL 题清理泛化指标：binlog 题要讲 `binlog_format`、`mysqlbinlog`、row image、GTID；连接池题要讲 Hikari 指标；归档题要讲迁移量、校验差异、主从延迟和任务耗时。
5. `n-plus-one.md` 和 `lazy-loading.md` 可联动修，前者讲现象和优化，后者讲 MyBatis 延迟加载触发机制，避免内容重复但边界不清。
