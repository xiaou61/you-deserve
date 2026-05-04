# 题目质检 Batch 21：MySQL 索引与执行计划 201-210

审查时间：2026-05-03  
范围：排序后的第 201-210 道题，`content/questions/mysql/count-optimization.md` 至 `content/questions/mysql/mysql-buffer-pool.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批集中在 MySQL 索引、执行计划、Join 和 InnoDB 内存结构。`covering-index.md`、`index-condition-pushdown.md`、`mysql-b-plus-tree.md`、`mysql-buffer-pool.md` 的基础方向比较稳；但 hard 难度题仍有“标题很高级、机制展开偏浅”的问题，尤其 Join 算法和 EXPLAIN ANALYZE 需要补真实执行计划字段、版本边界和优化器细节。

- 10 篇均命中数据库通用模板，后半段大量复用 `explain、慢日志、锁等待、命中率、QPS、P99`。
- 2 篇存在重复 `## 图解提示`：`invisible-index.md`、`mysql-adaptive-hash-index.md`。
- `count-optimization.md` 的文件名像“count 优化”，但 frontmatter slug 是 `mysql-count-difference`，标题和正文也是 count 三者区别，建议统一定位。
- 图解节点有截断：`select...`、`Extra 中出...`、`where/order by/lim...`，执行计划类题尤其影响理解。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mysql/count-optimization.md` | 内容正确，但定位不一致 | P1 | `count(*)`/`count(1)`/`count(字段)` 的区别正确，也能说明 `count(字段)` 忽略 NULL、大表 count 成本高。但文件名是 `count-optimization.md`，slug 却是 `mysql-count-difference`，题目也不是专讲 count 优化，建议统一命名或补成“count 区别 + count 优化”。若保留优化题，应补 InnoDB 精确 count 成本、二级小索引统计、近似计数、汇总表、缓存计数一致性。 |
| 2 | `content/questions/mysql/covering-index.md` | 主体扎实，图解截断 | P2 | 覆盖索引不是新索引类型、查询列都在索引里可避免回表、`Using index` 与 `Using index condition` 不同，这些正确。建议补覆盖索引与联合索引最左前缀的关系、where/order by/select 三类列如何设计、超宽索引写入代价、`select *` 破坏覆盖、`EXPLAIN` 中 Extra 字段的判断边界。 |
| 3 | `content/questions/mysql/explain-analyze.md` | 方向正确，真实输出细节不足 | P2 | EXPLAIN 是预估计划，EXPLAIN ANALYZE 会实际执行并显示真实耗时/行数，这个核心正确。建议补 MySQL 8.0.18+ 版本背景、实际输出中的 estimated rows、actual rows、actual time、loops、执行会带来真实负载，线上只在只读副本/低峰/限条件下使用，DML/重查询不要随便跑。 |
| 4 | `content/questions/mysql/filesort.md` | 概念正确，可补算法和指标 | P2 | `Using filesort` 表示额外排序，不一定落盘，order by 无合适索引和大分页风险都正确。建议补 one-pass/two-pass filesort、`sort_buffer_size`、临时文件、`Using temporary` 区别、联合索引排序规则、`ORDER BY ... LIMIT` 优化、深分页 seek 改写。图解节点 `where、order by、lim...` 截断。 |
| 5 | `content/questions/mysql/index-condition-pushdown.md` | 主体正确，可补触发边界 | P2 | ICP 在索引扫描阶段提前判断部分 where 条件，减少回表，`Using index condition` 与覆盖索引不同，这些正确。建议补 MySQL 5.6 引入、常见联合索引示例、只能下推可在索引列上判断的条件、不能替代最左前缀、ICP 开关 `optimizer_switch`、如何用 handler read 指标观察回表减少。 |
| 6 | `content/questions/mysql/invisible-index.md` | 方向正确，图解重复 | P1 | 不可见索引用来让优化器默认忽略索引，评估删除影响，仍会维护且不节省存储，这些正确。但重复 `图解提示`，追问偏模板。建议补 MySQL 8.0 支持、`ALTER TABLE ... ALTER INDEX ... INVISIBLE/VISIBLE`、`optimizer_switch='use_invisible_indexes=on'` 测试方式、写入成本仍存在、与 drop index/online DDL 的区别、观察慢 SQL 和执行计划的窗口期。 |
| 7 | `content/questions/mysql/join-algorithms.md` | 基础方向正确，hard 深度不足 | P1 | 驱动表、被驱动表、被驱动表连接字段有索引时成本低，这些基础正确。但题目是 Join 算法，正文没有展开 Nested Loop、Index Nested-Loop、Block Nested-Loop、Batched Key Access、Hash Join 等机制，也没有讲 join buffer。建议补 `EXPLAIN` 里表顺序、type、rows、filtered、Extra 的判断，以及小表驱动不绝对、过滤后行数更关键。 |
| 8 | `content/questions/mysql/mysql-adaptive-hash-index.md` | 核心正确，追问和图解需修 | P1 | AHI 是 InnoDB 根据热点访问自动维护的内存哈希路径，适合热点等值查询，高并发写入可能有锁竞争，这些正确。但重复 `图解提示`，常见追问占位。建议补 `innodb_adaptive_hash_index`、分区/锁竞争、只适合部分索引前缀等值访问、范围查询无收益、通过 `SHOW ENGINE INNODB STATUS`/Performance Schema 观察 hash searches 和 non-hash searches。 |
| 9 | `content/questions/mysql/mysql-b-plus-tree.md` | 正文质量较好 | P2 | 磁盘 IO、树高、扇出、叶子节点链表、范围查询、B 树/Hash 对比、页分裂和主键选择都讲得比较完整。建议补 InnoDB 页大小、聚簇索引/二级索引叶子内容差异、联合索引按字典序排列、范围条件后的索引使用边界、为什么低选择性字段收益有限。 |
| 10 | `content/questions/mysql/mysql-buffer-pool.md` | 基础正确，InnoDB 细节可补 | P2 | Buffer Pool 缓存数据页/索引页，按页读写，脏页后台刷盘，配合 LRU 淘汰，这些正确。建议补 young/old LRU、预读、flush list、free list、脏页比例、checkpoint 与 redo log 的关系、Buffer Pool Instance、命中率/脏页/页读取指标，避免只说“内存缓存”。 |

## 优先修复建议

1. 先处理 `count-optimization.md` 的命名/slug/标题定位，不然修内容时容易跑题。
2. `join-algorithms.md` 按 hard 题重写核心段，补 Nested Loop、Index Nested-Loop、Block Nested-Loop、BKA、Hash Join 和 join buffer。
3. 修 `invisible-index.md`、`mysql-adaptive-hash-index.md` 的重复图解，并把占位追问改为版本、参数、指标和实际治理流程。
4. 执行计划类题统一补 `EXPLAIN` 证据：type、key、rows、filtered、Extra、actual time、actual rows、loops，而不是只说“看 explain”。
5. Buffer Pool、B+ 树、聚簇索引、覆盖索引和 ICP 需要交叉统一术语：页、回表、叶子节点、覆盖索引、索引下推各自解决的问题不要混在一起。
