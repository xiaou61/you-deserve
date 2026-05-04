# 题目质检 Batch 35：Redis 数据结构与工具机制 341-350

审查时间：2026-05-04  
范围：按文件路径排序后的第 341-350 道题，`content/questions/redis/redis-data-structures.md` 至 `content/questions/redis/redis-quicklist-listpack.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批是 Redis 基础结构和常用工程技巧，覆盖数据结构、分布式锁、过期淘汰、GEO、热 key/大 key、key 设计、Lua、持久化、Pipeline 和 quicklist/listpack。`redis-data-structures.md`、`redis-distributed-lock.md`、`redis-expire-eviction.md`、`redis-hot-key-big-key.md`、`redis-persistence.md` 的基础答案较稳；GEO、key 设计、Lua、Pipeline、quicklist/listpack 仍偏“概念介绍”，需要补命令、配置、内部编码和线上风险。

- 6 篇命中通用详解模板：`redis-geo.md`、`redis-key-design.md`、`redis-lua.md`、`redis-pipeline.md`、`redis-quicklist-listpack.md`，以及部分结构题后半段。
- 2 篇存在重复 `## 图解提示`：`redis-geo.md`、`redis-quicklist-listpack.md`。
- 图解节点截断集中在大 value、quicklist/listpack 等内部结构，部分节点仍是“验证闭环/面试收束”模板。
- 本批优先补“命令怎么用、什么时候不用、怎么观测风险”，否则对中高级 Redis 面试支撑不足。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/redis/redis-data-structures.md` | 正文质量较好 | P2 | String、Hash、List、Set、ZSet 的场景划分清楚。建议补底层编码变化、常见命令、对象过大风险、ZSet 分数精度、Hash 适合对象但不适合无限扩字段，以及选择结构时如何看读写模式。 |
| 2 | `content/questions/redis/redis-distributed-lock.md` | 正文质量较好 | P2 | `SET NX PX`、唯一标识、Lua 解锁、续期风险和可靠性边界讲得较好。建议补可重入锁、公平性、主从切换丢锁、业务执行超过 TTL、Watchdog、fencing token，以及什么场景应改用数据库锁或 ZooKeeper/etcd。 |
| 3 | `content/questions/redis/redis-expire-eviction.md` | 正文质量较好 | P2 | 过期删除与内存淘汰的触发时机和策略边界清楚。建议补惰性删除、定期删除、`maxmemory-policy`、volatile/allkeys 系列差异、TTL 集中失效、淘汰监控指标和淘汰导致缓存命中率下降的排查。 |
| 4 | `content/questions/redis/redis-geo.md` | 方向正确，GEO 命令细节不足 | P1 | 添加经纬度、距离计算、附近查询方向正确，但重复 `## 图解提示`。建议补 `GEOADD`、`GEODIST`、`GEOSEARCH`、`WITHDIST/WITHCOORD/ASC/COUNT`、底层 GeoHash/ZSet、精度限制、坐标合法性、隐私合规和大范围查询性能。 |
| 5 | `content/questions/redis/redis-hot-key-big-key.md` | 正文质量较好 | P2 | 热 key、大 key、发现、拆分、异步治理方向较好。建议补 `--bigkeys`、`MEMORY USAGE`、代理层热点探测、本地缓存、读写分离、hash 拆 field、ZSet/List 分页、删除用 `UNLINK` 和治理前后的指标对比。 |
| 6 | `content/questions/redis/redis-key-design.md` | 方向正确，Cluster 和治理细节不足 | P1 | 业务前缀、冒号分层、避免过长、TTL、环境隔离方向正确，但正文模板化。建议补 key 命名规范、版本号、租户维度、hash tag、避免高基数扫描、TTL 随机化、value 大小约束、灰度迁移和废弃 key 清理机制。 |
| 7 | `content/questions/redis/redis-lua.md` | 方向正确，脚本边界不足 | P1 | 原子释放锁、限流、库存扣减、多 key 判断这些场景正确。建议补 `EVAL/EVALSHA`、`KEYS/ARGV` 规范、脚本执行期间阻塞、禁止长耗时逻辑、Cluster 下 key 同 slot 限制、脚本缓存、确定性要求和 Lua 报错后的处理。 |
| 8 | `content/questions/redis/redis-persistence.md` | 正文质量较好 | P2 | RDB/AOF 的恢复速度、数据安全、重写和组合使用讲得清楚。建议补 `appendfsync`、AOF rewrite、RDB fork 写时复制、混合持久化、磁盘抖动、恢复演练和不同业务 RPO/RTO 下的选择。 |
| 9 | `content/questions/redis/redis-pipeline.md` | 方向正确，输出缓冲和错误处理不足 | P1 | Pipeline 降低 RTT 的核心正确，但正文模板化。建议补 Pipeline 不是事务、不保证中间命令一起成功、批量大小控制、输出缓冲区风险、与 MGET/MSET 的选择、集群跨节点拆分、客户端异常重试和慢消费者影响。 |
| 10 | `content/questions/redis/redis-quicklist-listpack.md` | 方向正确，内部编码深度不足 | P1 | quicklist 和 listpack 的节省内存方向正确，但重复 `## 图解提示`。建议补 ziplist 被 listpack 替代、quicklist 是 listpack 双向链表、压缩深度、节点大小配置、插入删除代价、版本差异和如何通过 `OBJECT ENCODING` 观察。 |

## 优先修复建议

1. 先修 `redis-geo.md`、`redis-quicklist-listpack.md` 的重复 `## 图解提示`。
2. 每篇 Redis 工具题至少补 4 类证据：常用命令、关键参数、不能用的边界、线上观测方式。
3. key 设计、Pipeline、Lua 都和 Cluster 有交叉，建议统一补 hash tag、同 slot、多 key、客户端拆分和失败重试。
4. 内部结构题要避免只说“省内存”，补编码演进、配置项、代价和 `OBJECT ENCODING`/`MEMORY USAGE` 验证。
5. 分布式锁和 RedLock 后续应统一写 fencing token、主从切换和锁超时，避免同一概念在不同题中互相矛盾。
