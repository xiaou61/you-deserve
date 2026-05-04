# 题目质检 Batch 23：MySQL 复制、事务与分片 221-230

审查时间：2026-05-04  
范围：按文件路径排序后的第 221-230 道题，`content/questions/mysql/mysql-master-slave.md` 至 `content/questions/mysql/mysql-sharding.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 MySQL 主从复制、MVCC、Next-Key Lock、优化器、深分页、分区表、幻读、三类日志、GTID 和分库分表。`mysql-mvcc.md` 与 `mysql-redo-undo-binlog.md` 的正文质量最好，能把隐藏字段、undo 版本链、Read View、redo/binlog/undo 分工和两阶段提交讲清；其余 8 篇都有不同程度的通用模板污染，尤其复制、锁、分区、GTID 这些本该讲细机制的题，后半段变成“背景、链路、验证闭环”的泛化段落。

- 8 篇命中通用详解模板：除 `mysql-mvcc.md`、`mysql-redo-undo-binlog.md` 外，其余均有模板化段落。
- 4 篇存在重复 `## 图解提示`：`mysql-next-key-lock.md`、`mysql-partitioning.md`、`mysql-phantom-read.md`、`mysql-replication-gtid.md`。
- 图解节点截断集中在复制和锁题：`主库提交事务时写入 bi...`、`relay...`、`Next-Key Loc...`、`Read V...`、`GTID 由 serve...`。
- 多数 `常见追问` 仍只有 2 个短答，复制、分片、锁、分区题都缺“怎么排查、怎么验证、什么场景会失败、版本/参数边界”。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mysql/mysql-master-slave.md` | 基础链路正确，复制细节不足 | P1 | “主库写 binlog、从库 IO 线程拉取、写 relay log、SQL 线程重放”方向正确。但正文缺少 dump thread、position/GTID 定位、relay log、半同步、并行复制、复制延迟和一致性读策略。建议补完整链路：主库提交事务写 binlog，从库根据位点或 GTID 拉取，写入 relay log，再由 worker 重放；说明异步复制不保证强一致，读写分离要处理主从延迟；补 `Seconds_Behind_Source`、relay log 堆积、大事务、慢 SQL、网络抖动等排查抓手。 |
| 2 | `content/questions/mysql/mysql-mvcc.md` | 正文质量较好 | P2 | 版本链、trx_id、roll_pointer、undo log、Read View、快照读和当前读讲得比较清楚。建议补读已提交和可重复读下 Read View 生成时机不同：RC 通常每条语句生成，RR 通常事务内首次快照读生成；补 purge 与 history list length 的关系、长事务为什么会拖住 undo 清理、当前读为什么仍要配合锁，方便接线上问题。 |
| 3 | `content/questions/mysql/mysql-next-key-lock.md` | 概念正确，细节明显不足 | P1 | “Next-Key Lock = 记录锁 + 间隙锁，用来防止幻读”正确，但后半段是通用模板，追问像占位，且重复 `## 图解提示`。建议补 `(prev, current]` 这类区间理解、supremum 伪记录、唯一索引等值命中时可能退化为记录锁、普通快照读不加锁、当前读和范围更新更相关、无索引时锁范围可能扩大。图解应画索引记录与间隙，而不是泛泛的验证闭环。 |
| 4 | `content/questions/mysql/mysql-optimizer.md` | 方向对，但像提纲 | P2 | 能说出统计信息、成本估算、索引选择、Join 顺序和排序/临时表决策，但缺真实优化器工作细节。建议补逻辑改写、谓词下推、常量折叠、访问路径选择、Join reorder、索引统计信息和直方图、`ANALYZE TABLE`、`optimizer_trace`，并说明优化器可能因为统计信息过期或数据倾斜选错计划。 |
| 5 | `content/questions/mysql/mysql-pagination-optimization.md` | 核心方向正确，方案可更工程化 | P2 | 深分页慢因为 `offset` 要跳过大量数据，游标分页和延迟关联方向正确。建议补执行成本：`limit offset, size` 通常要扫描 offset+size 后丢弃前 offset 行；延迟关联先用覆盖索引拿主键再回表；游标分页要有稳定排序，常见写法是 `(create_time, id)` 组合条件；任意跳页和无限滚动的产品形态差异也要讲清。 |
| 6 | `content/questions/mysql/mysql-partitioning.md` | 方向正确，限制条件不足 | P1 | “分区表适合历史数据管理，不是索引优化万能药”是对的，但正文没有讲 MySQL 分区的硬限制。建议补：只有查询条件包含分区键时才可能分区裁剪；分区表仍在同一实例内，不等于分库分表；唯一键/主键与分区表达式存在约束；分区过多会增加元数据和优化器成本；适合按时间 drop/truncate partition 管理历史数据，不适合解决所有慢查询。重复 `## 图解提示` 需要修。 |
| 7 | `content/questions/mysql/mysql-phantom-read.md` | 概念可用，快照读/当前读边界需补 | P1 | “同一事务内相同条件再次查询出现新记录”正确，也提到快照读依赖 Read View、当前读用 Next-Key Lock。但详解泛化，追问只有 2 个短答，且重复 `## 图解提示`。建议补：RR 下普通快照读通过 MVCC 避免看到后续提交记录；当前读、范围 update/delete、`for update` 要靠锁防止插入；无索引会扩大锁范围；RC 与 RR 对幻读和 gap lock 的行为差异要讲清。 |
| 8 | `content/questions/mysql/mysql-redo-undo-binlog.md` | 正文质量较好 | P2 | redo/undo/binlog 的层级、用途、WAL、MVCC、主从复制和两阶段提交都讲到了，属于这一批较好的内容。建议补 crash 场景判断：redo prepare、binlog 写入、redo commit 三个点如何保证一致；补 binlog format、sync_binlog、innodb_flush_log_at_trx_commit、undo purge，避免只讲概念分工。 |
| 9 | `content/questions/mysql/mysql-replication-gtid.md` | 核心正确，工程边界不足 | P1 | “GTID 给事务全局唯一编号，便于主从切换和复制定位”正确，也提到 `server_uuid` 和 transaction id。但正文没有展开 executed/purged GTID set、auto-position、故障切换、errant transaction、跳过事务风险和启用前提。建议补 `SOURCE_AUTO_POSITION`/自动定位思路、GTID 集合如何避免手工找 binlog position、主从切换时如何比对已执行集合。重复 `## 图解提示` 和节点截断需要修。 |
| 10 | `content/questions/mysql/mysql-sharding.md` | 方向正确，落地复杂度偏浅 | P1 | 垂直拆分、水平拆分、跨库 join、分布式事务、全局 ID、跨分片分页这些点是对的，但正文仍是模板化扩展。建议补分片键选择、范围分片和哈希分片取舍、数据倾斜和热点分片、扩容再均衡、广播表/绑定表、跨分片聚合、二级索引和唯一约束、全局 ID 方案、迁移校验与灰度回滚。分库分表题最容易考“拆完之后怎么治理”，现有内容还不够。 |

## 优先修复建议

1. 先修 4 篇重复 `## 图解提示`：`mysql-next-key-lock.md`、`mysql-partitioning.md`、`mysql-phantom-read.md`、`mysql-replication-gtid.md`，并把图解节点从截断短语改成可读机制图。
2. 复制相关题分层重写：`mysql-master-slave.md` 讲 binlog/relay log/IO thread/SQL thread/延迟，`mysql-replication-gtid.md` 讲 GTID set/auto-position/failover，不要互相混成“主从复制更方便”。
3. 锁和事务题统一补“快照读 vs 当前读、RC vs RR、记录锁 vs gap lock vs next-key lock、索引命中与锁范围”，让 MVCC、幻读、Next-Key Lock 三篇可以互相引用但不重复。
4. 分区和分库分表要明确边界：分区表是单实例内的数据组织和维护手段，分库分表是分布式扩展方案，二者解决的问题、代价和查询限制不同。
5. `mysql-mvcc.md` 和 `mysql-redo-undo-binlog.md` 可作为高质量模板，但仍建议补线上指标和故障场景，例如 history list length、长事务、两阶段提交崩溃恢复、binlog/redo 刷盘参数。
