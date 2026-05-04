# 题目质检 Batch 22：MySQL 锁、索引与执行计划 211-220

审查时间：2026-05-04  
范围：排序后的第 211-220 道题，`content/questions/mysql/mysql-change-buffer.md` 至 `content/questions/mysql/mysql-lock-deadlock.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 Change Buffer、死锁日志、EXPLAIN、间隙锁、索引失效、最左前缀、Skip Scan、插入意向锁、JSON 索引和死锁排查。`mysql-explain.md`、`mysql-index-failure.md`、`mysql-index-left-prefix.md`、`mysql-lock-deadlock.md` 的主体内容比较可用，能把基础判断和线上排查连起来；其余 6 篇存在较明显的数据库通用模板污染，题目越偏 InnoDB 专项机制，后半段越容易变成“场景、指标、验证闭环”的泛化套话。

- 6 篇命中通用详解模板：`mysql-change-buffer.md`、`mysql-deadlock-log.md`、`mysql-gap-lock.md`、`mysql-index-skip-scan.md`、`mysql-insert-intention-lock.md`、`mysql-json-index.md`。
- 5 篇存在重复 `## 图解提示`：`mysql-change-buffer.md`、`mysql-deadlock-log.md`、`mysql-index-skip-scan.md`、`mysql-insert-intention-lock.md`、`mysql-json-index.md`。
- 图解节点多处截断：`SHOW ENGINE...`、`TRANSACT...`、`id betw...`、`EXPLAIN...`、`insert int...`、`MySQL 5.7 常用...`，影响图解作为学习材料的可读性。
- 这批很多 `常见追问` 仍只有 2 个短问短答，尤其锁机制题缺“隔离级别、索引命中、锁兼容、死锁日志字段、版本/参数边界”这些能接住面试追问的内容。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/mysql/mysql-change-buffer.md` | 核心定义正确，专项机制不足 | P1 | “只适用于非唯一二级索引、写多读少收益更明显、唯一索引不能简单延后”这些方向正确。但 `详细讲解` 后半段是数据库通用模板，没有讲清 Change Buffer 与 Buffer Pool、redo、merge 的关系。建议补：它缓冲的是非唯一二级索引页修改，不适用于主键和唯一索引；页读入、后台线程或 purge 等时机会触发 merge；`innodb_change_buffering`、`innodb_change_buffer_max_size` 的治理边界；读多写少、SSD、热点页已在 Buffer Pool 时收益会下降。 |
| 2 | `content/questions/mysql/mysql-deadlock-log.md` | 方向正确，但日志字段不够细 | P1 | “看两个事务各自持有什么锁、等待什么锁、对应 SQL 和索引”是对的，但还不足以支撑真实排障。建议补 `LATEST DETECTED DEADLOCK`、`TRANSACTION`、`WAITING FOR THIS LOCK TO BE GRANTED`、`HOLDS THE LOCK(S)`、`WE ROLL BACK TRANSACTION` 等字段解读；补 `RECORD LOCKS`、`lock_mode X/S`、`locks rec but not gap`、`gap before rec`、`insert intention waiting` 的含义；说明 `SHOW ENGINE INNODB STATUS` 只保留最近一次死锁，必要时用 `innodb_print_all_deadlocks` 或 Performance Schema 观察。 |
| 3 | `content/questions/mysql/mysql-explain.md` | 主体扎实，可继续补证据字段 | P2 | 重点看 `type`、`key`、`rows`、`Extra` 的组织方式清楚，追问也能说明 `EXPLAIN` 与 `EXPLAIN ANALYZE` 的差别。建议再补 `key_len` 判断联合索引用到几列、`filtered` 判断过滤比例、`id/select_type` 看执行层级、`Using temporary` 与 `Using filesort` 的组合风险，以及 `rows` 是估算值、要和慢日志/真实耗时交叉验证。 |
| 4 | `content/questions/mysql/mysql-gap-lock.md` | 概念方向正确，锁边界需精修 | P1 | “锁索引记录之间的范围、防止当前读幻读、可能引发等待和死锁”正确。但详解仍是通用模板，缺少 InnoDB 锁边界。建议补：普通一致性快照读通常不加 gap lock；`for update`、`lock in share mode`、`update/delete` 这类当前读更相关；唯一索引等值命中已有记录时通常只需要记录锁；gap lock 主要阻止插入，多个 gap lock 本身可能兼容；读已提交隔离级别下搜索和索引扫描的 gap lock 行为与可重复读不同。 |
| 5 | `content/questions/mysql/mysql-index-failure.md` | 内容较稳，可补执行计划证据 | P2 | 函数、隐式转换、最左前缀、范围中断、左模糊、低选择性、成本模型都讲到了，追问质量较好。建议补 `key_len`、`rows`、`filtered`、`Extra` 如何证明“没有用于定位而只是过滤”；补字符集/排序规则不一致、OR 触发 index merge 或放弃索引、函数索引/生成列作为结构性补救方案，避免只停在规则清单。 |
| 6 | `content/questions/mysql/mysql-index-left-prefix.md` | 主体扎实，例外与设计策略可补 | P2 | 用 `(a,b,c)` 的字典序解释最左前缀很清楚，范围条件后的字段“定位/过滤”区分也比较到位。建议补 Skip Scan 这类优化器例外、ICP 对后续字段过滤的帮助、联合索引字段顺序与排序/分组/覆盖索引的权衡，以及 `EXPLAIN key_len` 如何验证实际用到的前缀长度。 |
| 7 | `content/questions/mysql/mysql-index-skip-scan.md` | 题目高级，正文偏占位 | P1 | 一句话结论“枚举联合索引最左列少量不同值，再对后续列查找”是可用的，但正文没有真正展开算法代价。建议补一个 `(gender, age)` 这类首列低基数示例，解释优化器如何把缺失首列条件拆成多段范围扫描；说明首列 distinct 值越多成本越高，Skip Scan 不能替代合理联合索引；补如何通过 `EXPLAIN`/优化器信息确认，以及它与最左前缀原则的关系。当前重复 `## 图解提示` 且 visual 节点截断。 |
| 8 | `content/questions/mysql/mysql-insert-intention-lock.md` | 核心方向正确，兼容矩阵不足 | P1 | 能说出“不是表级意向锁、插入前在 gap 上申请、不同位置可并发、遇到 gap lock 会等”，但缺少最容易追问的锁兼容细节。建议补：插入意向锁是 gap lock 的一种插入前意图，不等于 IX；多个事务插入同一 gap 的不同位置通常不互斥；与 next-key lock/gap lock 的冲突要结合插入位置和索引范围；死锁日志里 `insert intention waiting` 如何定位到具体索引和插入值。重复 `## 图解提示` 需要修。 |
| 9 | `content/questions/mysql/mysql-json-index.md` | 方向正确，版本与类型细节不足 | P1 | “生成列或函数索引提取 JSON 路径后建索引，高频字段建议拆普通列”是正确方向。但详解过泛，缺少可操作 SQL 和类型边界。建议补：虚拟/存储生成列的取舍、`JSON_EXTRACT`/`JSON_UNQUOTE` 的类型和字符集问题、函数索引适用边界、JSON 数组查询可考虑多值索引、核心关系字段不要长期藏在 JSON 里。图解提示重复，节点 `MySQL 5.7 常用...` 等截断明显。 |
| 10 | `content/questions/mysql/mysql-lock-deadlock.md` | 基础可用，追问仍偏薄 | P2 | 死锁本质、四个必要条件、InnoDB 自动检测并回滚一方、统一加锁顺序、补索引、缩短事务、失败重试都讲到了，方向正确。建议补死锁与锁等待超时的区别、等待图如何形成环、死锁日志中 victim 选择和回滚范围、应用层重试要保证幂等，另外 `常见追问` 只有 2 个短答，应补“如何复现、如何从日志还原两条 SQL、如何降低死锁检测压力、线上能不能只靠重试”这类追问。 |

## 优先修复建议

1. 先清理 5 篇重复 `## 图解提示`，并同步修 visual 节点截断，避免页面上“已生成图解”看起来像半成品。
2. 对 `mysql-change-buffer.md`、`mysql-index-skip-scan.md`、`mysql-insert-intention-lock.md`、`mysql-json-index.md` 做专项重写，把通用模板替换成 InnoDB/MySQL 机制、参数、示例 SQL 和执行计划证据。
3. 死锁相关两篇要分工：`mysql-deadlock-log.md` 专讲日志字段和还原等待环，`mysql-lock-deadlock.md` 专讲形成原因、预防治理和应用层重试，不要互相重复。
4. 锁机制题统一补隔离级别和索引命中边界：快照读/当前读、记录锁/gap lock/next-key lock/插入意向锁、唯一索引等值命中、无索引导致锁范围扩大。
5. EXPLAIN 与索引题统一补证据字段：`type`、`key`、`key_len`、`rows`、`filtered`、`Extra`、慢日志和 `EXPLAIN ANALYZE`，让“怎么判断”不只停留在概念层。
