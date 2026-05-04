# 题目质检 Batch 24：MySQL SQL 优化与一致性 231-240

审查时间：2026-05-04  
范围：按文件路径排序后的第 231-240 道题，`content/questions/mysql/mysql-slow-query.md` 至 `content/questions/mysql/temporary-table.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖慢 SQL、事务隔离、undo purge、Online DDL、乐观锁/悲观锁、优化器直方图、前缀索引、主从延迟、SQL 逻辑执行顺序和临时表。`mysql-transaction-isolation.md` 的主体最好，能把 RC/RR、MVCC、快照读和当前读讲开；其余多数题有正确的短答案，但 `详细讲解` 仍大量复用通用模板，缺少真实命令、参数、执行计划字段、监控指标和故障案例。

- 9 篇命中通用详解模板：除 `mysql-transaction-isolation.md` 外，其余均有模板化段落。
- 3 篇存在重复 `## 图解提示`：`mysql-undo-log-purge.md`、`optimizer-histogram.md`、`read-write-splitting-delay.md`。
- 图解节点截断集中在执行计划和机制名：`EXPLAIN 看...`、`undo l...`、`select ... f...`、`Histogram...`、`Read V...`、`group by 无法直...`。
- 本批共性问题是“知道方向，但证据链不足”：慢 SQL 没讲慢日志字段，Online DDL 没讲算法和锁级别，直方图没讲更新/删除命令，读写分离没讲延迟检测与写后读策略。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mysql/mysql-slow-query.md` | 排查方向正确，证据字段不足 | P1 | 慢日志、EXPLAIN、索引、扫描行数、返回量、锁等待这些方向是对的，但正文缺少真实排查证据。建议补慢日志字段：`Query_time`、`Lock_time`、`Rows_examined`、`Rows_sent`、库名、时间点；补 `pt-query-digest` 或聚合分析思路；补 `EXPLAIN ANALYZE`、Performance Schema、锁等待、临时表、filesort、buffer pool 读放大等信号，避免只说“看 EXPLAIN”。 |
| 2 | `content/questions/mysql/mysql-transaction-isolation.md` | 正文质量较好 | P2 | 四个隔离级别、脏读、不可重复读、幻读、InnoDB 默认 RR、MVCC 和锁机制讲得比较完整，追问也比多数题强。建议补 MySQL RR 下普通快照读与当前读的差异、RC 下 gap lock 行为边界、Serializable 的实际代价，以及“隔离级别不能替代业务幂等和并发控制”的工程提示。 |
| 3 | `content/questions/mysql/mysql-undo-log-purge.md` | 方向正确，Purge 机制太浅 | P1 | “undo log 不会一直保留，没有活跃事务需要旧版本后会被 purge 清理”正确。但正文模板化，追问占位，重复 `## 图解提示`。建议补：undo 同时服务回滚和 MVCC；Read View 会阻止旧版本清理；长事务会导致 history list 变长、undo 表空间膨胀；purge 线程清理 delete-mark 和旧版本；排查长事务、history list length、undo tablespace 的指标和治理手段。 |
| 4 | `content/questions/mysql/online-ddl.md` | 基础方向正确，版本和算法边界不足 | P1 | “Online 不等于零锁、不同操作支持程度不同、生产大表要评估”正确。建议补 `ALGORITHM=COPY/INPLACE/INSTANT`、`LOCK=NONE/SHARED/EXCLUSIVE`、元数据锁在开始/结束阶段仍可能阻塞、Instant DDL 的版本和操作限制、大表变更要看复制延迟和回滚成本，必要时使用 gh-ost 或 pt-online-schema-change。 |
| 5 | `content/questions/mysql/optimistic-pessimistic-lock.md` | 方向正确，事务与失败处理不足 | P2 | 悲观锁用 `select ... for update`、乐观锁用 version 条件更新，这些基础正确。建议补悲观锁必须在事务中才有意义，查询条件要命中索引否则锁范围可能扩大；乐观锁更新失败要有重试、提示或冲突合并策略；库存扣减要加 `stock > 0` 条件；版本号、时间戳、业务状态机各自适合的场景也应区分。 |
| 6 | `content/questions/mysql/optimizer-histogram.md` | 题目高级，正文偏模板 | P1 | “直方图帮助优化器了解列值分布，不能替代索引”正确，但缺少 MySQL 可操作细节。建议补适用场景：列值分布倾斜、没有合适索引、优化器估算偏差；补 `ANALYZE TABLE ... UPDATE HISTOGRAM`、删除直方图、桶数量、统计信息过期风险；补用 `EXPLAIN`/`optimizer_trace` 对比更新前后计划。重复 `## 图解提示` 需要修，visual 节点过于泛。 |
| 7 | `content/questions/mysql/prefix-index.md` | 核心可用，选择方法可补 | P2 | 前缀索引节省空间但牺牲区分度、覆盖能力和排序能力，这些正确。建议补前缀长度评估方法：比较 `count(distinct left(col,n)) / count(*)` 与完整列选择性；补字符长度与字节长度、不同字符集影响；补 `TEXT/BLOB` 建索引必须指定前缀长度；补前缀索引无法保存完整值，因此覆盖查询和精准排序受限。 |
| 8 | `content/questions/mysql/read-write-splitting-delay.md` | 方向正确，延迟检测和一致性策略不足 | P1 | “写后短时间读主、强一致接口读主、延迟监控动态切换、缓存或版本号兜底”方向正确。但正文没有讲怎么判断从库追上。建议补心跳表、复制延迟指标、GTID 等待、业务写后读 sticky 路由、按用户/请求上下文读主窗口、半同步只能降低丢数据风险但不等于消灭读延迟。重复 `## 图解提示` 和 visual 截断需要修。 |
| 9 | `content/questions/mysql/sql-execution-order.md` | 基础可用，但逻辑/物理顺序需区分 | P2 | `from -> where -> group by -> having -> select -> order by -> limit` 作为逻辑顺序可用，where/having 和别名规则也对。建议补 `JOIN ON`、`DISTINCT`、窗口函数的相对位置，并强调这是逻辑处理顺序，不等于优化器真实物理执行顺序。优化器可能重写谓词和调整执行计划，不能用逻辑顺序解释所有性能现象。 |
| 10 | `content/questions/mysql/temporary-table.md` | 方向正确，内部临时表细节不足 | P1 | `Using temporary`、group by/order by/distinct/union/子查询触发场景正确，但正文仍泛。建议补内部临时表和业务临时表区别、内存临时表与磁盘临时表的转换条件、`tmp_table_size`/`max_heap_table_size`、`Created_tmp_disk_tables` 等指标、`Using temporary` 与 `Using filesort` 的组合风险，以及如何通过索引让分组/排序直接按顺序输出。 |

## 优先修复建议

1. 先修 `mysql-undo-log-purge.md`、`optimizer-histogram.md`、`read-write-splitting-delay.md` 的重复 `## 图解提示`，并把截断节点改成机制图节点。
2. SQL 优化类题统一补证据字段：慢日志字段、`EXPLAIN` 字段、`EXPLAIN ANALYZE`、Performance Schema、临时表计数、排序/锁等待指标。
3. DDL、直方图、读写分离这类运维题要补命令和参数，不然面试里只能停在概念层。
4. 事务隔离、undo purge、MVCC、幻读这几篇要统一术语：Read View、版本链、当前读、快照读、purge、history list，不要每篇各讲一套。
5. 乐观锁/悲观锁题可以补业务冲突处理：失败重试、幂等、库存非负、状态机约束、事务边界和索引命中。
